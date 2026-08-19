// Create a Linear issue for every merged PR and attach the PR URL to it. The attachment is what
// `linear-release.yml`'s sync follows to resolve #NN back to an issue, so a PR without one is
// invisible to the release and missing from the changelog.
//
// Env: LINEAR_API_KEY, LINEAR_TEAM (team key or name), GITHUB_EVENT_PATH, LINEAR_DRY_RUN.

import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const LINEAR_ENDPOINT = 'https://api.linear.app/graphql'

// Drives Linear's native release-notes grouping.
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

export const categoryFromTitle = (title) => {
  const match = /^\s*([a-zA-Z][a-zA-Z0-9]*)(?:\([^)]*\))?!?:/.exec(title ?? '')
  if (!match) return DEFAULT_CATEGORY
  return CATEGORY_BY_PREFIX[match[1].toLowerCase()] ?? DEFAULT_CATEGORY
}

export const skipReason = ({ merged, headRef }) => {
  if (!merged) return 'closed without merging'
  if ((headRef ?? '').startsWith('release/v')) return 'release-bump PR (owned by the release workflows)'
  return null
}

export const findTeam = (teams, wanted) => {
  const target = wanted.trim().toLowerCase()
  return teams.find(t => t.key?.toLowerCase() === target || t.name?.toLowerCase() === target) ?? null
}

export const pickDoneState = states =>
  states.find(s => s.type === 'completed' && /done/i.test(s.name)) ??
  states.find(s => s.type === 'completed') ??
  null

export const buildDescription = ({ url, author, mergedAt, body }) => {
  const lines = [`Auto-created from merged PR ${url}`]
  if (author) lines.push(`Author: @${author}`)
  if (mergedAt) lines.push(`Merged: ${mergedAt}`)
  return body ? `${body.trim()}\n\n---\n\n${lines.join('\n')}` : lines.join('\n')
}

// A personal API key is sent raw; an OAuth token needs the Bearer prefix.
const auth = key => (/^lin_oauth_/.test(key) ? `Bearer ${key}` : key)

const makeLinear = apiKey => async (query, variables = {}) => {
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

const resolveTeam = async (linear, wanted) => {
  const data = await linear(
    `query { teams(first: 250) { nodes { id key name states { nodes { id name type } } } } }`,
  )
  const team = findTeam(data.teams.nodes, wanted)
  if (!team) {
    const known = data.teams.nodes.map(t => `${t.key} (${t.name})`).join(', ')
    throw new Error(`No Linear team matching "${wanted}". Visible teams: ${known || 'none'}`)
  }
  const done = pickDoneState(team.states.nodes)
  if (!done) throw new Error(`Team ${team.key} has no completed workflow state`)
  return { teamId: team.id, teamKey: team.key, doneStateId: done.id, doneStateName: done.name }
}

const ensureLabel = async (linear, teamId, name, dryRun, log) => {
  const data = await linear(
    `query($teamId: ID!, $name: String!) {
       issueLabels(filter: { team: { id: { eq: $teamId } }, name: { eq: $name } }) { nodes { id } }
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
    `mutation($input: IssueLabelCreateInput!) { issueLabelCreate(input: $input) { issueLabel { id } } }`,
    { input: { teamId, name } },
  )
  return created.issueLabelCreate.issueLabel.id
}

// Linear dedupes attachments by URL per issue, so this is idempotent.
const attachPr = async (linear, issueId, ctx, dryRun, log) => {
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

// Best-effort: the issue and attachment already exist, so a failed comment must not fail the run.
const commentOnPr = async (number, issue) => {
  const body = `Tracked in Linear as [${issue.identifier}](${issue.url}), auto-created on merge.`
  try {
    await execFileAsync('gh', ['pr', 'comment', String(number), '--body', body])
  } catch (error) {
    console.warn(`Could not comment on PR #${number}: ${error.message}`)
  }
}

const run = async () => {
  const apiKey = process.env.LINEAR_API_KEY
  const wantedTeam = process.env.LINEAR_TEAM
  const eventPath = process.env.GITHUB_EVENT_PATH
  const dryRun = ['1', 'true'].includes((process.env.LINEAR_DRY_RUN ?? '').toLowerCase())

  if (!apiKey) throw new Error('LINEAR_API_KEY is required')
  // Verified: a lin_accesskey_ pipeline key 401s on the GraphQL API, so catch the mix-up with the
  // release action's LINEAR_ACCESS_KEY here rather than as a bare auth failure.
  if (apiKey.startsWith('lin_accesskey_')) {
    throw new Error(
      'LINEAR_API_KEY looks like a release pipeline access key (lin_accesskey_). Those only work ' +
        'with linear-release; issue creation needs a Linear API key from Settings → API.',
    )
  }
  if (!wantedTeam) throw new Error('LINEAR_TEAM is required (team key or name)')
  if (!eventPath) throw new Error('GITHUB_EVENT_PATH is required')

  const pr = JSON.parse(await readFile(eventPath, 'utf8')).pull_request
  if (!pr) throw new Error('event payload has no pull_request')

  const ctx = {
    number: pr.number,
    title: pr.title ?? '',
    body: pr.body ?? '',
    url: pr.html_url,
    headRef: pr.head?.ref ?? '',
    author: pr.user?.login ?? '',
    mergedAt: pr.merged_at ?? '',
    merged: pr.merged === true,
  }

  const skip = skipReason(ctx)
  if (skip) {
    console.log(`Skipping PR #${ctx.number}: ${skip}`)
    return
  }

  const linear = makeLinear(apiKey)
  const log = (msg, payload) => console.log(dryRun ? `[dry-run] ${msg}` : msg, payload ?? '')

  // An existing attachment means a human linked the PR, or a previous run already created it.
  const existing = await linear(
    `query($url: String!) { attachmentsForURL(url: $url) { nodes { issue { identifier url } } } }`,
    { url: ctx.url },
  )
  const linked = existing.attachmentsForURL.nodes.find(n => n.issue)?.issue
  if (linked) {
    console.log(`PR #${ctx.number} is already attached to ${linked.identifier} — nothing to do`)
    return
  }

  const { teamId, teamKey, doneStateId, doneStateName } = await resolveTeam(linear, wantedTeam)
  const category = categoryFromTitle(ctx.title)
  const labelId = await ensureLabel(linear, teamId, category, dryRun, log)

  const input = {
    teamId,
    title: ctx.title,
    description: buildDescription(ctx),
    stateId: doneStateId,
    ...(labelId ? { labelIds: [labelId] } : {}),
  }

  if (dryRun) {
    log(`issueCreate in ${teamKey} (${doneStateName})`, input)
    await attachPr(linear, '<new-issue-id>', ctx, dryRun, log)
    return
  }

  const created = await linear(
    `mutation($input: IssueCreateInput!) {
       issueCreate(input: $input) { success issue { id identifier url } }
     }`,
    { input },
  )
  if (!created.issueCreate.success) throw new Error(`issueCreate failed for PR #${ctx.number}`)
  const issue = created.issueCreate.issue
  console.log(`Created ${issue.identifier} (${category}, ${doneStateName}) for PR #${ctx.number}`)

  await attachPr(linear, issue.id, ctx, dryRun, log)
  await commentOnPr(ctx.number, issue)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  await run()
}
