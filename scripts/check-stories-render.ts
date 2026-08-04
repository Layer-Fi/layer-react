import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { chromium, type Page } from 'playwright'
import { DOCS_SCREENSHOT_WIDTHS } from './docs-screenshots.manifest'

// Renders every story headlessly and fails on a render error, an unhandled exception, or a
// play function that throws. Chromatic covers only the design system, so without this a
// broken feature story — or a play function that silently stops producing the state a docs
// image depends on — would reach main unnoticed.

const STATIC_ROOT = 'storybook-static'
const INDEX_PATH = `${STATIC_ROOT}/index.json`
const PORT = 6008
const CONCURRENCY = 4
const SETTLE_MS = 750

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
}

function serve() {
  const server = http.createServer((req, res) => {
    const requested = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname)
    const file = path.join(STATIC_ROOT, requested === '/' ? 'index.html' : requested)

    if (!path.resolve(file).startsWith(path.resolve(STATIC_ROOT)) || !fs.existsSync(file)) {
      res.writeHead(404).end()
      return
    }

    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream',
      'Service-Worker-Allowed': '/',
    })
    fs.createReadStream(file).pipe(res)
  })

  return new Promise<http.Server>(resolve => server.listen(PORT, () => resolve(server)))
}

async function renderStory(page: Page, storyId: string) {
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

  await page.goto(`http://localhost:${PORT}/iframe.html?viewMode=story&id=${storyId}`)
  // Overlays (Drawer, Modal) portal outside #storybook-root, leaving it empty, so accept
  // anything painted into the body.
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
  if (!fs.existsSync(INDEX_PATH)) {
    console.error(`${INDEX_PATH} not found. Run \`npm run storybook:build\` first.`)
    process.exit(1)
  }

  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8')) as {
    entries: Record<string, { type: string }>
  }
  const storyIds = Object.entries(index.entries)
    .filter(([, entry]) => entry.type === 'story')
    .map(([id]) => id)

  const server = await serve()
  const browser = await chromium.launch()
  const broken: string[] = []
  let done = 0

  const queue = [...storyIds]
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (let storyId = queue.pop(); storyId; storyId = queue.pop()) {
      // A story pinned to one width via `globals.viewport` still renders at whatever the
      // context is, so use the widest — anything narrower is a size-class variant Chromatic
      // or the docs capture already covers.
      const context = await browser.newContext({
        viewport: { width: DOCS_SCREENSHOT_WIDTHS.desktop, height: 900 },
      })
      const page = await context.newPage()

      try {
        const failures = await renderStory(page, storyId)
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
