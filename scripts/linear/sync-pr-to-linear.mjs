// Sync a merged GitHub PR to a Linear issue, so every PR lands in the release scope.
//
// Why: `linear/linear-release-action sync` builds release scope from the PR/MR numbers in
// merge commits — Linear resolves `#NN` back to the issues *linked to that PR*. A PR with no
// linked Linear issue is therefore invisible to the release. This script guarantees the link.
//
// Matcher scope: on merge, look at the issues already in the in-progress release. If this PR
// is part of the same change as one of them (judged by Claude Haiku), add the PR to that
// issue — so related PRs collapse to one release-notes line. Otherwise create a new issue in
// Done. Either way the PR URL is attached, which is the link Linear's resolver keys off.
//
// Runs from .github/workflows/linear-pr-sync.yml on `pull_request: closed` (merged) to main.
//
// Env:
//   LINEAR_API_KEY    (required) Linear personal API key (GraphQL). Sent as the raw token; an
//                     OAuth access token would need the `Bearer ` prefix instead — see auth().
//   LINEAR_TEAM_KEY   (required) team key (e.g. "ENG") that owns auto-created issues.
//   ANTHROPIC_API_KEY (required) for the add-vs-create classifier (Claude Haiku).
//   GITHUB_EVENT_PATH (required in CI) path to the pull_request event payload.
//   LINEAR_DRY_RUN    when "1"/"true", logs the mutations it would run and skips all writes.
//                     (The read-only release query + classifier still run.)
//
// No npm deps: Node 22 global fetch for both the Linear GraphQL and Anthropic Messages calls,
// plus the GitHub event payload. The one GitHub write (a PR comment) uses the `gh` CLI.

import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const LINEAR_ENDPOINT = 'https://api.linear.app/graphql'

// PR title prefix -> Linear label name. Drives Linear's native release notes grouping.
// Applied only to issues this script CREATES; human-created issues keep their own triage.
const CATEGORY_BY_PREFIX = {
  fix: 'Bug',
  feat: 'Feature',
  feature: 'Feature',
  refactor: 'Improvement',
  perf: 'Improvement',
  chore: 'Improvement',
  build: 'Improvement',
  ci: 'Improvement',
  cleanup: 'Improvement',
  style: 'Improvement',
  test: 'Improvement',
  i18n: 'i18n',
  docs: 'Docs',
}
const DEFAULT_CATEGORY = 'Uncategorized'

// --- pure helpers (exported for unit tests) ---------------------------------

// Map a PR title to a category label via its conventional-commit prefix.
// Handles scopes and the breaking-change bang: "feat(ui)!: ..." -> "feat".
export const categoryFromTitle = (title) => {
  const match = /^\s*([a-zA-Z][a-zA-Z0-9]*)(?:\([^)]*\))?!?:/.exec(title ?? '')
  if (!match) return DEFAULT_CATEGORY
  return CATEGORY_BY_PREFIX[match[1].toLowerCase()] ?? DEFAULT_CATEGORY
}

// Extract candidate Linear issue identifiers (e.g. ENG-123) from free text. These are only
// *candidates*: callers verify them against Linear, so noise like "UTF-8" is harmless because
// it won't resolve to a real issue. Team keys are 2+ uppercase alphanumerics in Linear.
export const detectLinearIds = (...texts) => {
  const ids = new Set()
  const re = /\b([A-Z][A-Z0-9]+-\d+)\b/g
  for (const text of texts) {
    if (!text) continue
    for (const m of text.matchAll(re)) ids.add(m[1])
  }
  return [...ids]
}

// Decide whether to skip a pull_request event. Release-bump PRs carry no product change and
// are handled by the release workflows; unmerged closes are no-ops.
export const skipReason = ({ merged, headRef }) => {
  if (!merged) return 'PR was closed without merging'
  if ((headRef ?? '').startsWith('release/v')) return 'release-bump PR (handled by release workflows)'
  return null
}

// --- Linear GraphQL client --------------------------------------------------

const auth = (key) => (/^lin_oauth_/.test(key) ? `Bearer ${key}` : key)

const makeLinear = (apiKey) => async (query, variables = {}) => {
  const res = await fetch(LINEAR_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: auth(apiKey) },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`Linear API ${res.status}: ${await res.text()}`)
  const json = await res.json()
  if (json.errors) throw new Error(`Linear GraphQL error: ${JSON.stringify(json.errors)}`)
  return json.data
}

// --- main -------------------------------------------------------------------

const run = async () => {
  const apiKey = process.env.LINEAR_API_KEY
  const teamKey = process.env.LINEAR_TEAM_KEY
  const eventPath = process.env.GITHUB_EVENT_PATH
  const dryRun = ['1', 'true'].includes((process.env.LINEAR_DRY_RUN ?? '').toLowerCase())

  if (!apiKey) throw new Error('LINEAR_API_KEY is required')
  if (!teamKey) throw new Error('LINEAR_TEAM_KEY is required')
  if (!eventPath) throw new Error('GITHUB_EVENT_PATH is required')

  const event = JSON.parse(await readFile(eventPath, 'utf8'))
  const pr = event.pull_request
  if (!pr) throw new Error('event payload has no pull_request')

  const ctx = {
    number: pr.number,
    title: pr.title ?? '',
    body: pr.body ?? '',
    url: pr.html_url,
    headRef: pr.head?.ref ?? '',
    merged: pr.merged === true,
  }

  const skip = skipReason(ctx)
  if (skip) {
    console.log(`Skipping PR #${ctx.number}: ${skip}`)
    return
  }

  const linear = makeLinear(apiKey)
  const log = (msg, payload) => console.log(dryRun ? `[dry-run] ${msg}` : msg, payload ?? '')

  // 1. Authoritative existence check: is an issue already linked to this PR URL? This is the
  // same link Linear's release resolver uses, so a hit means the PR is already in scope.
  const byUrl = await linear(
    `query($url: String!) { attachmentsForURL(url: $url) { nodes { issue { id identifier url } } } }`,
    { url: ctx.url },
  )
  let issue = byUrl.attachmentsForURL.nodes.find((n) => n.issue)?.issue

  // 2. Race backstop: Linear's native GitHub integration may not have created the link yet.
  // Resolve any identifier mentioned in the PR back to a real issue before deciding to create.
  if (!issue) {
    for (const id of detectLinearIds(ctx.title, ctx.headRef, ctx.body)) {
      try {
        const data = await linear(`query($id: String!) { issue(id: $id) { id identifier url } }`, { id })
        if (data.issue) {
          issue = data.issue
          break
        }
      } catch {
        // Not a real identifier (e.g. "UTF-8"); ignore and keep looking.
      }
    }
  }

  // 3. Human already linked the PR to an issue: respect it, just guarantee the PR link.
  if (issue) {
    console.log(`PR #${ctx.number} already maps to ${issue.identifier}`)
    await ensureAttachment(linear, issue.id, ctx, dryRun, log)
    return
  }

  // 4. No existing link. Scope of the matcher: the issues already in the in-progress
  // release. Either this PR belongs to one of them (add it) or it's new (create it).
  const candidates = await getReleaseIssues(linear)
  const match = candidates.length ? await classifyAgainstRelease(ctx, candidates) : null

  // 4a. Belongs to an existing release issue: add the PR to it. One issue accumulates the
  // PRs that make up the same change, so it stays one line in the release notes.
  if (match) {
    console.log(`PR #${ctx.number} adds to ${match.identifier}: ${match.rationale}`)
    await ensureAttachment(linear, match.id, ctx, dryRun, log)
    await commentOnPr(ctx.number, match, 'added to existing')
    return
  }

  // 4b. New: create an issue in Done, labeled by the PR's category, linked to the PR.
  const category = categoryFromTitle(ctx.title)
  const { teamId, doneStateId } = await resolveTeam(linear, teamKey)
  const labelId = await ensureLabel(linear, teamId, category, dryRun, log)

  const description = `${ctx.body ? `${ctx.body}\n\n` : ''}Auto-created from merged PR ${ctx.url}`
  const input = {
    teamId,
    title: ctx.title,
    description,
    stateId: doneStateId,
    ...(labelId ? { labelIds: [labelId] } : {}),
  }

  if (dryRun) {
    log('issueCreate', input)
    await ensureAttachment(linear, '<new-issue-id>', ctx, dryRun, log)
    return
  }

  const created = await linear(
    `mutation($input: IssueCreateInput!) {
       issueCreate(input: $input) { success issue { id identifier url } }
     }`,
    { input },
  )
  const newIssue = created.issueCreate.issue
  console.log(`Created ${newIssue.identifier} (${category}) for PR #${ctx.number}`)

  await ensureAttachment(linear, newIssue.id, ctx, dryRun, log)
  await commentOnPr(ctx.number, newIssue, category)
}

// Issues already attached to the in-progress (started, not yet completed) release — the only
// candidates the matcher considers. NOTE: the Linear Releases GraphQL surface is not fully
// documented publicly; this query shape is verified against the live schema in Phase 0
// (needs LINEAR_API_KEY) and adjusted there if the field names differ.
const getReleaseIssues = async (linear) => {
  const data = await linear(
    `query {
       releases(filter: { state: { eq: started } }, first: 1) {
         nodes { issues { nodes { id identifier title description } } }
       }
     }`,
  )
  return data.releases?.nodes?.[0]?.issues?.nodes ?? []
}

// Ask Claude (Haiku — cheap, fast) whether this PR is part of the same change as one of the
// issues already in the release. Returns the matched issue (with rationale) or null. Biases
// toward "none" so an uncertain PR becomes its own issue rather than being mis-grouped.
// Raw fetch + structured output, matching this repo's no-dep tooling style.
const MATCH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    index: { type: 'integer', description: 'Index of the matching issue, or -1 for none' },
    confidence: { type: 'number' },
    rationale: { type: 'string' },
  },
  required: ['index', 'confidence', 'rationale'],
}

export const buildMatchPrompt = (ctx, candidates) => {
  const list = candidates
    .map((c, i) => `${i}. [${c.identifier}] ${c.title}\n${(c.description ?? '').slice(0, 300)}`)
    .join('\n\n')
  return (
    `A pull request was just merged. Decide whether it is part of the SAME unit of work as ` +
    `one of the existing release issues below (e.g. another commit in an ongoing "API ` +
    `hardening" effort), in which case it should be added to that issue, or whether it is a ` +
    `distinct change that deserves its own issue.\n\n` +
    `Only match when they clearly describe the same effort. When in doubt, return -1 (its own ` +
    `issue) — a spurious new issue is cheap, a wrong grouping corrupts the release notes.\n\n` +
    `PR title: ${ctx.title}\nPR branch: ${ctx.headRef}\nPR body:\n${(ctx.body ?? '').slice(0, 1500)}\n\n` +
    `Existing release issues:\n${list}`
  )
}

const classifyAgainstRelease = async (ctx, candidates) => {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: buildMatchPrompt(ctx, candidates) }],
      output_config: { format: { type: 'json_schema', schema: MATCH_SCHEMA } },
    }),
  })
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  if (data.stop_reason === 'refusal') return null
  const text = data.content?.find((b) => b.type === 'text')?.text
  let out
  try {
    out = JSON.parse(text)
  } catch {
    return null
  }
  if (!out || out.index < 0 || out.index >= candidates.length || out.confidence < 0.7) return null
  return { ...candidates[out.index], rationale: out.rationale }
}

// Resolve a team key to its id and its Done (completed-type) workflow state id.
const resolveTeam = async (linear, teamKey) => {
  const data = await linear(
    `query($key: String!) {
       teams(filter: { key: { eq: $key } }) {
         nodes { id states { nodes { id name type } } }
       }
     }`,
    { key: teamKey },
  )
  const team = data.teams.nodes[0]
  if (!team) throw new Error(`No Linear team with key "${teamKey}"`)

  const states = team.states.nodes
  const done =
    states.find((s) => s.type === 'completed' && /done/i.test(s.name)) ??
    states.find((s) => s.type === 'completed')
  if (!done) throw new Error(`Team "${teamKey}" has no completed (Done) workflow state`)

  return { teamId: team.id, doneStateId: done.id }
}

// Find a team label by name, creating it if absent. Returns its id (null on dry-run create).
const ensureLabel = async (linear, teamId, name, dryRun, log) => {
  const data = await linear(
    `query($teamId: ID!, $name: String!) {
       issueLabels(filter: { team: { id: { eq: $teamId } }, name: { eq: $name } }) {
         nodes { id }
       }
     }`,
    { teamId, name },
  )
  const existing = data.issueLabels.nodes[0]
  if (existing) return existing.id

  if (dryRun) {
    log('issueLabelCreate', { teamId, name })
    return null
  }
  const created = await linear(
    `mutation($input: IssueLabelCreateInput!) {
       issueLabelCreate(input: $input) { issueLabel { id } }
     }`,
    { input: { teamId, name } },
  )
  return created.issueLabelCreate.issueLabel.id
}

// Attach the PR URL to the issue. Linear dedupes attachments by URL per issue, so this is
// idempotent — and it is the link the release resolver follows from PR#NN to the issue.
const ensureAttachment = async (linear, issueId, ctx, dryRun, log) => {
  const input = { issueId, url: ctx.url, title: `PR #${ctx.number}`, subtitle: ctx.title }
  if (dryRun) {
    log('attachmentCreate', input)
    return
  }
  await linear(
    `mutation($input: AttachmentCreateInput!) { attachmentCreate(input: $input) { success } }`,
    { input },
  )
}

// Leave a breadcrumb on the PR so the created issue is discoverable from GitHub. Best-effort:
// a comment failure must not fail the sync.
const commentOnPr = async (number, issue, category) => {
  const body = `Linked to Linear issue [${issue.identifier}](${issue.url}) (category: ${category}), auto-created on merge.`
  try {
    await execFileAsync('gh', ['pr', 'comment', String(number), '--body', body])
  } catch (error) {
    console.warn(`Could not comment on PR #${number}: ${error.message}`)
  }
}

// Only run when invoked directly (not when imported by tests).
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  await run()
}
