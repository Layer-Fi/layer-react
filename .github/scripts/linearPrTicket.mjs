/**
 * Creates a Linear issue for a pull request and writes its identifier into the description.
 *
 * Replaces the `LAY-NEW` magic word. Linear's integration converts a magic word on a PR's first
 * `opened` webhook only — a word arriving by description edit, reopen, or title change is ignored
 * (all four tested on #1773 and #1776), and a PR gets one `opened` in its life. So a PR that missed
 * that moment could never be given a ticket, which is what happened to #1776. Creating the issue
 * here removes the timing dependency and lets any PR be backfilled by re-running the workflow.
 *
 * Linking stays Linear's job: writing the identifier into the description is the documented way to
 * link an already-open PR, and unlike creation it is not tied to `opened`.
 */

const API = 'https://api.linear.app/graphql'

const {
  LINEAR_API_KEY: apiKey,
  LINEAR_TEAM_KEY: teamKey,
  GITHUB_REPOSITORY: repo,
  PR: prNumber,
} = process.env

function fail(message) {
  console.error(`::error::${message}`)
  process.exit(1)
}

if (!apiKey) {
  fail(
    'LINEAR_API_KEY is unset. It must be a personal API key (lin_api_…); LINEAR_ACCESS_KEY is a '
    + 'pipeline key for linear-release and is rejected by the GraphQL API.',
  )
}
if (!teamKey) fail('LINEAR_TEAM_KEY is unset.')
if (!prNumber) fail('PR is unset.')

/** `gh` ships on the runner, so reading and patching the PR needs no extra dependency. */
async function gh(args) {
  const { execFileSync } = await import('node:child_process')
  return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
}

async function graphql(query, variables) {
  const response = await fetch(API, {
    method: 'POST',
    // A personal API key goes in bare — `Bearer` is the OAuth form and is rejected here.
    headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    fail(`Linear API returned ${response.status} ${response.statusText}. Check LINEAR_API_KEY.`)
  }

  const payload = await response.json()
  if (payload.errors?.length) {
    fail(`Linear API error: ${payload.errors.map(error => error.message).join('; ')}`)
  }
  return payload.data
}

const pr = JSON.parse(await gh(['api', `repos/${repo}/pulls/${prNumber}`]))

/*
 * Linear links from the title and branch as well as the body, so a PR that already names an issue
 * would end up with a second one. Matched against this team's key rather than a generic
 * `[A-Z]+-\d+`, which any `UTF-8` or `SHA-256` in a description would trip.
 */
const existing = `${pr.body ?? ''} ${pr.title} ${pr.head.ref}`
  .match(new RegExp(`\\b${teamKey}-\\d+\\b`, 'i'))
if (existing) {
  console.log(`PR #${prNumber} already references ${existing[0]}.`)
  process.exit(0)
}

/*
 * `team(id:)` takes a UUID and the docs describe no filter for looking one up by key, so the teams
 * are listed and matched here.
 */
const { teams } = await graphql('query { teams { nodes { id key } } }')
const team = teams.nodes.find(node => node.key === teamKey)
if (!team) {
  fail(`No Linear team with key ${teamKey}. Found: ${teams.nodes.map(node => node.key).join(', ')}.`)
}

const { issueCreate } = await graphql(
  `mutation ($input: IssueCreateInput!) {
     issueCreate(input: $input) { success issue { identifier url } }
   }`,
  {
    input: {
      teamId: team.id,
      title: pr.title,
      description: `Opened by @${pr.user.login}.\n\n${pr.html_url}`,
    },
  },
)

if (!issueCreate?.success) fail('Linear reported the issue was not created.')

const { identifier, url } = issueCreate.issue
const body = `${pr.body ?? ''}\n\n## Linear\n\n${identifier}\n`.replace(/^\n+/, '')

await gh(['api', '-X', 'PATCH', `repos/${repo}/pulls/${prNumber}`, '-f', `body=${body}`, '--silent'])

console.log(`PR #${prNumber} → ${identifier} (${url})`)
