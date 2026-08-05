import fs from 'node:fs'
import path from 'node:path'
import { chromium, type Page } from 'playwright'
import { PUBLIC_API_TAG } from '../.storybook/tags'
import { DOCS_SCREENSHOT_WIDTHS } from './docs-screenshots.manifest'
import { requireStorybookBuild, serveStorybookStatic, STATIC_ROOT } from './serve-storybook-static'

// Runs axe against the stories for components we actually export. Nothing else in CI asserts
// accessibility, and the library leans on react-aria-components — whose guarantees only hold if
// the props are wired up correctly, which is exactly what a rendered check can catch.
//
// Scoped to `public-api` rather than every story: that's the surface consumers embed, and it keeps
// the run to a few minutes. Known violations live in the allowlist and are meant to be burned down.

const INDEX_PATH = `${STATIC_ROOT}/index.json`
const ALLOWLIST_PATH = 'scripts/a11y-allowlist.json'
const AXE_SOURCE = 'node_modules/axe-core/axe.min.js'
const CONCURRENCY = 4
const SETTLE_MS = 750

// WCAG 2.1 A and AA. `best-practice` rules are excluded — they are advisory and would make the
// first run unactionably noisy.
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

type Violation = { id: string, impact: string | null, help: string, nodes: { target: string[] }[] }

/** `storyId::ruleId`, so an allowlist entry pins one rule on one story. */
type Finding = string

async function auditStory(page: Page, origin: string, storyId: string, axeSource: string) {
  await page.goto(`${origin}/iframe.html?viewMode=story&id=${storyId}`)
  await page.waitForFunction(
    () => (document.querySelector('#storybook-root')?.children.length ?? 0) > 0
      || (document.body.innerText?.trim().length ?? 0) > 0,
    undefined,
    { timeout: 30_000 },
  )
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(SETTLE_MS)

  await page.addScriptTag({ content: axeSource })

  const violations = await page.evaluate(async (tags) => {
    // @ts-expect-error axe is injected into the page, not bundled.
    const results = await window.axe.run(document, { runOnly: { type: 'tag', values: tags } })
    return (results as { violations: Violation[] }).violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map(node => node.target.join(' ')),
    }))
  }, AXE_TAGS)

  return violations
}

async function main() {
  requireStorybookBuild(INDEX_PATH)

  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8')) as {
    entries: Record<string, { type: string, tags?: string[] }>
  }
  const storyIds = Object.entries(index.entries)
    .filter(([, entry]) => entry.type === 'story' && (entry.tags?.includes(PUBLIC_API_TAG) ?? false))
    .map(([id]) => id)

  if (storyIds.length === 0) {
    console.error(`No stories tagged \`${PUBLIC_API_TAG}\` in ${INDEX_PATH}.`)
    process.exit(1)
  }

  const allowlist: Finding[] = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8')) as Finding[]
  const allowed = new Set(allowlist)
  const axeSource = fs.readFileSync(path.resolve(AXE_SOURCE), 'utf8')

  const { server, origin } = await serveStorybookStatic()
  const browser = await chromium.launch()
  const found = new Map<Finding, string>()
  const errors: string[] = []
  let done = 0

  const queue = [...storyIds]
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (let storyId = queue.pop(); storyId; storyId = queue.pop()) {
      const context = await browser.newContext({
        viewport: { width: DOCS_SCREENSHOT_WIDTHS.desktop, height: 900 },
      })
      const page = await context.newPage()

      try {
        for (const violation of await auditStory(page, origin, storyId, axeSource)) {
          found.set(
            `${storyId}::${violation.id}`,
            `${violation.impact ?? 'unknown'} — ${violation.help} (${violation.nodes[0] ?? '?'})`,
          )
        }
      }
      catch (error) {
        errors.push(`${storyId}: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`)
      }
      finally {
        await context.close()
        done += 1
        if (done % 20 === 0) console.info(`  ${done}/${storyIds.length}`)
      }
    }
  })

  await Promise.all(workers)
  await browser.close()
  server.close()

  if (process.argv.includes('--update')) {
    const updated = [...found.keys()].sort()
    fs.writeFileSync(ALLOWLIST_PATH, `${JSON.stringify(updated, null, 2)}\n`)
    console.info(`Wrote ${updated.length} finding(s) to ${ALLOWLIST_PATH}.`)
    return
  }

  const unexpected = [...found.keys()].filter(finding => !allowed.has(finding)).sort()
  // Reported but NOT failed: whether a given element renders can differ between a local run and
  // CI (fonts, timing, a detail panel that settles a beat later). Failing on entries that merely
  // didn't fire would deadlock the gate — the same story would be a new violation in one
  // environment and a stale entry in the other.
  const stale = allowlist.filter(finding => !found.has(finding)).sort()

  if (errors.length > 0) {
    console.error(`\n${errors.length} story/stories could not be audited:\n`)
    for (const error of errors) console.error(`  ${error}`)
  }

  if (unexpected.length > 0) {
    console.error(`\n${unexpected.length} new accessibility violation(s):\n`)
    for (const finding of unexpected) console.error(`  ${finding}\n      ${found.get(finding)}`)
    console.error(`\nFix them, or add the \`storyId::ruleId\` line to ${ALLOWLIST_PATH} with a reason in the PR.\n`)
  }

  if (stale.length > 0) {
    console.info(`\n${stale.length} allowlisted violation(s) did not fire — candidates to remove from ${ALLOWLIST_PATH}:\n`)
    for (const finding of stale) console.info(`  ${finding}`)
    console.info('')
  }

  if (errors.length > 0 || unexpected.length > 0) process.exit(1)

  console.info(
    `\nNo new accessibility violations across ${storyIds.length} \`${PUBLIC_API_TAG}\` stories `
    + `(${allowlist.length} allowlisted).`,
  )
}

void main()
