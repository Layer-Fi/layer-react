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

export const categoryFromTitle = (title) => {
  const [, prefix] = /^\s*([a-zA-Z][a-zA-Z0-9]*)(?:\([^)]*\))?!?:/.exec(title ?? '') ?? []
  return CATEGORY_BY_PREFIX[prefix?.toLowerCase()] ?? 'Uncategorized'
}

export const skipReason = ({ merged, headRef }) => {
  if (!merged) return 'closed without merging'
  if ((headRef ?? '').startsWith('release/v')) return 'release-bump PR (owned by the release workflows)'
  return null
}

export const findTeam = (teams, wanted) => {
  const target = wanted.trim().toLowerCase()
  return teams.find(t => [t.key, t.name].some(v => v?.toLowerCase() === target)) ?? null
}

export const pickDoneState = states =>
  states.find(s => s.type === 'completed' && /done/i.test(s.name)) ??
  states.find(s => s.type === 'completed') ??
  null

export const buildDescription = ({ url, author, mergedAt, body }) => {
  const provenance = [
    `Auto-created from merged PR ${url}`,
    author && `Author: @${author}`,
    mergedAt && `Merged: ${mergedAt}`,
  ].filter(Boolean).join('\n')
  return body ? `${body.trim()}\n\n---\n\n${provenance}` : provenance
}

const requireEnv = (name, hint = '') => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required${hint}`)
  return value
}

// A personal API key is sent raw; an OAuth token needs the Bearer prefix.
const auth = key => (/^lin_oauth_/.test(key) ? `Bearer ${key}` : key)

// Mutations short-circuit to null under LINEAR_DRY_RUN, so no caller threads a dry-run flag.
const makeLinear = (apiKey, dryRun) => {
  const send = async (query, variables) => {
    const res = await fetch(LINEAR_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth(apiKey) },
      body: JSON.stringify({ query, variables }),
    })
    if (!res.ok) throw new Error(`Linear API ${res.status}: ${await res.text()}`)
    const { data, errors } = await res.json()
    if (errors) throw new Error(`Linear GraphQL error: ${JSON.stringify(errors)}`)
    return data
  }

  return {
    query: send,
    mutate: async (label, query, variables) => {
      if (!dryRun) return send(query, variables)
      console.log(`[dry-run] ${label}`, variables.input)
      return null
    },
  }
}

const resolveTeam = async (linear, wanted) => {
  const { teams } = await linear.query(
    `query { teams(first: 250) { nodes { id key name states { nodes { id name type } } } } }`,
  )
  const team = findTeam(teams.nodes, wanted)
  if (!team) {
    const known = teams.nodes.map(t => `${t.key} (${t.name})`).join(', ')
    throw new Error(`No Linear team matching "${wanted}". Visible teams: ${known || 'none'}`)
  }
  const state = pickDoneState(team.states.nodes)
  if (!state) throw new Error(`Team ${team.key} has no completed workflow state`)
  return { team, state }
}

const ensureLabel = async (linear, teamId, name) => {
  const { issueLabels } = await linear.query(
    `query($teamId: ID!, $name: String!) {
       issueLabels(filter: { team: { id: { eq: $teamId } }, name: { eq: $name } }) { nodes { id } }
     }`,
    { teamId, name },
  )
  if (issueLabels.nodes[0]) return issueLabels.nodes[0].id

  const created = await linear.mutate(
    'issueLabelCreate',
    `mutation($input: IssueLabelCreateInput!) { issueLabelCreate(input: $input) { issueLabel { id } } }`,
    { input: { teamId, name } },
  )
  return created?.issueLabelCreate.issueLabel.id ?? null
}

// Linear dedupes attachments by URL per issue, so this is idempotent.
const attachPr = (linear, issueId, { url, number, title }) =>
  linear.mutate(
    'attachmentCreate',
    `mutation($input: AttachmentCreateInput!) { attachmentCreate(input: $input) { success } }`,
    { input: { issueId, url, title: `PR #${number}`, subtitle: title } },
  )

// Best-effort: the issue and attachment already exist, so a failed comment must not fail the run.
const commentOnPr = async (number, { identifier, url }) => {
  const body = `Tracked in Linear as [${identifier}](${url}), auto-created on merge.`
  try {
    await execFileAsync('gh', ['pr', 'comment', String(number), '--body', body])
  } catch (error) {
    console.warn(`Could not comment on PR #${number}: ${error.message}`)
  }
}

const run = async () => {
  const apiKey = requireEnv('LINEAR_API_KEY')
  const wantedTeam = requireEnv('LINEAR_TEAM', ' (team key or name)')
  const eventPath = requireEnv('GITHUB_EVENT_PATH')
  const dryRun = ['1', 'true'].includes((process.env.LINEAR_DRY_RUN ?? '').toLowerCase())

  // Verified: a lin_accesskey_ pipeline key 401s here, so name the mix-up with the release
  // action's LINEAR_ACCESS_KEY rather than failing as a bare auth error.
  if (apiKey.startsWith('lin_accesskey_')) {
    throw new Error(
      'LINEAR_API_KEY is a release pipeline access key (lin_accesskey_), which only works with ' +
        'linear-release. Issue creation needs a Linear API key from Settings → API.',
    )
  }

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
  if (skip) return console.log(`Skipping PR #${ctx.number}: ${skip}`)

  const linear = makeLinear(apiKey, dryRun)

  // An existing attachment means a human linked the PR, or a previous run already created it.
  const { attachmentsForURL } = await linear.query(
    `query($url: String!) { attachmentsForURL(url: $url) { nodes { issue { identifier } } } }`,
    { url: ctx.url },
  )
  const linked = attachmentsForURL.nodes.find(n => n.issue)?.issue
  if (linked) return console.log(`PR #${ctx.number} already attached to ${linked.identifier}`)

  const { team, state } = await resolveTeam(linear, wantedTeam)
  const category = categoryFromTitle(ctx.title)
  const labelId = await ensureLabel(linear, team.id, category)

  const created = await linear.mutate(
    'issueCreate',
    `mutation($input: IssueCreateInput!) {
       issueCreate(input: $input) { success issue { id identifier url } }
     }`,
    {
      input: {
        teamId: team.id,
        title: ctx.title,
        description: buildDescription(ctx),
        stateId: state.id,
        ...(labelId ? { labelIds: [labelId] } : {}),
      },
    },
  )
  if (!created) return attachPr(linear, '(pending)', ctx)
  if (!created.issueCreate.success) throw new Error(`issueCreate failed for PR #${ctx.number}`)

  const issue = created.issueCreate.issue
  console.log(`Created ${issue.identifier} (${category}, ${state.name}) for PR #${ctx.number}`)
  await attachPr(linear, issue.id, ctx)
  await commentOnPr(ctx.number, issue)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  await run()
}
