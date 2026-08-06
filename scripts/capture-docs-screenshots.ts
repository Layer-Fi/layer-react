import fs from 'node:fs'
import path from 'node:path'
import { chromium, type Page } from 'playwright'
import { type DocsScreenshot, DOCS_SCREENSHOT_WIDTHS, DOCS_SCREENSHOTS } from './docs-screenshots.manifest'
import { requireStorybookBuild, serveStorybookStatic, STATIC_ROOT } from './serve-storybook-static'

// The story is rendered before its data lands, so settle after the network goes quiet.
// preview.tsx adds a 250ms floor to every mocked response.
const SETTLE_MS = 750

// Ceiling on the Inter webfont preflight, so an unresponsive rsms.me fails the run rather
// than hanging it.
const FONT_LOAD_TIMEOUT_MS = 30_000

// Poll rather than awaiting document.fonts.ready once: the face arrives via an @import in
// src/styles/index.scss, so it is not even registered until that sheet lands, and fonts.ready can
// resolve before then. A single check is a false negative waiting to happen.
//
// Bounded because page.evaluate has no timeout of its own — a stalled response would otherwise
// leave this pending forever.
//
// Declaring a helper inside the callback would break this: tsx compiles with esbuild's keepNames,
// which wraps named function bindings in a __name() call that does not exist in the page.
function hasInterLoaded(page: Page) {
  return page.evaluate(async (timeoutMs) => {
    const deadline = Date.now() + timeoutMs

    while (Date.now() < deadline) {
      if (Array.from(document.fonts).some(face => face.family === 'InterVariable' && face.status === 'loaded')) {
        return true
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return false
  }, FONT_LOAD_TIMEOUT_MS)
}

function parseArgs() {
  const args = process.argv.slice(2)
  const out = args[args.indexOf('--out') + 1]
  if (!args.includes('--out') || !out) {
    console.error('Usage: tsx scripts/capture-docs-screenshots.ts --out <dir> [--filter <substring>]')
    process.exit(1)
  }
  const filter = args.includes('--filter') ? args[args.indexOf('--filter') + 1] : undefined
  return { out, filter }
}

async function main() {
  const { out, filter } = parseArgs()

  requireStorybookBuild(STATIC_ROOT)

  const targets = filter
    ? DOCS_SCREENSHOTS.filter(({ storyId, out: file }) => storyId.includes(filter) || file.includes(filter))
    : DOCS_SCREENSHOTS

  if (targets.length === 0) {
    console.error(`No manifest entries match --filter ${filter}.`)
    process.exit(1)
  }

  const { server, origin } = await serveStorybookStatic()
  const browser = await chromium.launch()
  const failures: string[] = []

  // src/styles/index.scss pulls Inter from rsms.me, so every capture depends on that host being
  // reachable. A silent fallback to the generic sans reads as a diff on all 36 images, so fail
  // fast here rather than after working through the whole manifest. Each capture re-checks in its
  // own context, which is what actually guarantees the font for a given image.
  async function requireInterWebFont(storyId: string) {
    const page = await browser.newPage()
    let isLoaded = false

    try {
      // An unreachable rsms.me stalls the stylesheet, which can hold up `load` and time the
      // navigation out. Any failure in here means the same thing as a missing face, so report it
      // the same way rather than crashing with a navigation error.
      await page.goto(`${origin}/iframe.html?viewMode=story&id=${storyId}`, { timeout: FONT_LOAD_TIMEOUT_MS })
      await page.waitForSelector('#storybook-root > *', { timeout: FONT_LOAD_TIMEOUT_MS })

      isLoaded = await hasInterLoaded(page)
    }
    catch (error) {
      console.error(`Could not verify the Inter webfont: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`)
    }
    finally {
      await page.close()
    }

    if (!isLoaded) {
      console.error('The Inter webfont (https://rsms.me/inter/inter.css) did not load, so every capture')
      console.error('would fall back to the generic sans. Check network access to rsms.me and re-run.')
      await browser.close()
      server.close()
      process.exit(1)
    }
  }

  await requireInterWebFont(targets[0].storyId)

  async function capture({ storyId, out: file, viewport, interactAt, maxHeight, captureViewport }: DocsScreenshot) {
    const context = await browser.newContext({
      viewport: { width: DOCS_SCREENSHOT_WIDTHS[interactAt ?? viewport], height: 900 },
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
      colorScheme: 'light',
    })
    const page = await context.newPage()

    const crashes: string[] = []
    page.on('pageerror', error => crashes.push(error.message))

    try {
      await page.goto(`${origin}/iframe.html?viewMode=story&id=${storyId}`)
      await page.waitForSelector('#storybook-root > *', { timeout: 30_000 })
      // Collapse durations rather than removing animations: elements that start at opacity 0 and
      // rely on a `forwards` fill (the landing page hero) never become visible under
      // `animation: none`, but a 0s animation still applies its end state.
      await page.addStyleTag({
        content: `*, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }`,
      })
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(SETTLE_MS)

      // Storybook ships the error display hidden in every iframe; only a shown one is real.
      if (await page.locator('.sb-show-errordisplay').count() > 0) {
        crashes.push(await page.locator('#error-message').innerText())
      }
      if (crashes.length > 0) throw new Error(crashes.join('\n'))

      // After the crash checks: a face only reaches `loaded` once something renders with it, so a
      // story that died before mounting any text would look like a font failure. Contexts do not
      // share a cache, so this story fetched the font itself and could have missed even though the
      // preflight passed. Throwing here earns the retry below.
      if (!await hasInterLoaded(page)) {
        throw new Error('the Inter webfont (https://rsms.me/inter/inter.css) did not load')
      }

      if (interactAt && interactAt !== viewport) {
        await page.setViewportSize({ width: DOCS_SCREENSHOT_WIDTHS[viewport], height: 900 })
        await page.waitForTimeout(SETTLE_MS)
      }

      const target = path.join(out, file)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      // Scoped to the story root: `layout: 'fullscreen'` stretches the body to the viewport,
      // so a full-page shot pads short components with dead space.
      const root = page.locator('#storybook-root')
      const box = maxHeight ? await root.boundingBox() : null
      const clipped = maxHeight !== undefined && box !== null && box.height > maxHeight

      if (captureViewport) {
        // A viewport shot starts at the top of the page, so `maxHeight` just trims the bottom.
        await page.screenshot({
          path: target,
          animations: 'disabled',
          ...(maxHeight === undefined
            ? {}
            : { clip: { x: 0, y: 0, width: DOCS_SCREENSHOT_WIDTHS[viewport], height: maxHeight } }),
        })
      }
      else if (clipped) {
        // `clip` is page-relative and only covers the viewport unless the whole page is captured.
        await page.screenshot({
          path: target,
          fullPage: true,
          animations: 'disabled',
          clip: { x: box.x, y: box.y, width: box.width, height: maxHeight },
        })
      }
      else {
        await root.screenshot({ path: target, animations: 'disabled' })
      }

      const size = clipped || (captureViewport && maxHeight !== undefined)
        ? `clipped ${box === null ? '' : `${Math.round(box.height)}px `}-> ${maxHeight}px`
        : `${interactAt ? `${interactAt} -> ` : ''}${viewport}${captureViewport ? ' viewport' : ''}`
      console.info(`  ${file}  <-  ${storyId} (${size})`)
    }
    finally {
      await context.close()
    }
  }

  for (const target of targets) {
    try {
      await capture(target)
    }
    catch {
      // A story that renders identically every run can still lose a race on a loaded CI box.
      try {
        await capture(target)
      }
      catch (error) {
        failures.push(`${target.storyId}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  await browser.close()
  server.close()

  if (failures.length > 0) {
    console.error(`\n${failures.length} of ${targets.length} stories failed to capture:\n`)
    for (const failure of failures) console.error(`  ${failure}`)
    console.error('')
    process.exit(1)
  }

  console.info(`\nCaptured ${targets.length} screenshot(s) into ${out}.`)
}

void main()
