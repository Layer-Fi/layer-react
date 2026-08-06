import fs from 'node:fs'
import { chromium, type Page } from 'playwright'
import { DOCS_SCREENSHOT_WIDTHS } from './docs-screenshots.manifest'
import { requireStorybookBuild, serveStorybookStatic, STATIC_ROOT } from './serve-static'

// Renders every story headlessly and fails on a render error, an unhandled exception, or a
// play function that throws. Chromatic covers only the design system, so without this a
// broken feature story — or a play function that silently stops producing the state a docs
// image depends on — would reach main unnoticed.

const INDEX_PATH = `${STATIC_ROOT}/index.json`
const CONCURRENCY = 4
const SETTLE_MS = 750

async function renderStory(page: Page, origin: string, storyId: string) {
  const failures: string[] = []
  page.on('pageerror', error => failures.push(error.message))
  // Storybook reports a thrown play function through the console, not the error overlay.
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const text = message.text()
    if (/TestingLibraryElementError|Unable to find|play function|Timed out/.test(text)) {
      failures.push(text.split('\n')[0])
    }
  })

  await page.goto(`${origin}/iframe.html?viewMode=story&id=${storyId}`)
  // Overlays (Drawer, Modal) portal outside #storybook-root, so accept anything in the body.
  await page.waitForFunction(
    () => (document.querySelector('#storybook-root')?.children.length ?? 0) > 0
      || (document.body.innerText?.trim().length ?? 0) > 0,
    undefined,
    { timeout: 30_000 },
  )
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(SETTLE_MS)

  if (await page.locator('.sb-show-errordisplay').count() > 0) {
    failures.push(await page.locator('#error-message').innerText())
  }

  return failures
}

async function main() {
  requireStorybookBuild(INDEX_PATH)

  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8')) as {
    entries: Record<string, { type: string }>
  }
  const storyIds = Object.entries(index.entries)
    .filter(([, entry]) => entry.type === 'story')
    .map(([id]) => id)

  const { server, origin } = await serveStorybookStatic()
  const browser = await chromium.launch()
  const broken: string[] = []
  let done = 0

  const queue = [...storyIds]
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (let storyId = queue.pop(); storyId; storyId = queue.pop()) {
      const context = await browser.newContext({
        viewport: { width: DOCS_SCREENSHOT_WIDTHS.desktop, height: 900 },
      })
      const page = await context.newPage()

      try {
        const failures = await renderStory(page, origin, storyId)
        if (failures.length > 0) broken.push(`${storyId}\n      ${failures[0]}`)
      }
      catch (error) {
        broken.push(`${storyId}\n      ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`)
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

  if (broken.length > 0) {
    console.error(`\n${broken.length} of ${storyIds.length} stories failed to render:\n`)
    for (const failure of broken.sort()) console.error(`  ${failure}\n`)
    process.exit(1)
  }

  console.info(`\nAll ${storyIds.length} stories rendered without errors.`)
}

void main()
