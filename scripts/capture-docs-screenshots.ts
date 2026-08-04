import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { type DocsScreenshot, DOCS_SCREENSHOT_WIDTHS, DOCS_SCREENSHOTS } from './docs-screenshots.manifest'
import { requireStorybookBuild, serveStorybookStatic, STATIC_ROOT } from './serveStorybookStatic'

// The story is rendered before its data lands, so settle after the network goes quiet.
// preview.tsx adds a 250ms floor to every mocked response.
const SETTLE_MS = 750

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

  async function capture({ storyId, out: file, viewport, interactAt }: DocsScreenshot) {
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
      await page.addStyleTag({
        content: '*, *::before, *::after { animation: none !important; transition: none !important; }',
      })
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(SETTLE_MS)

      // Storybook ships the error display hidden in every iframe; only a shown one is real.
      if (await page.locator('.sb-show-errordisplay').count() > 0) {
        crashes.push(await page.locator('#error-message').innerText())
      }
      if (crashes.length > 0) throw new Error(crashes.join('\n'))

      if (interactAt && interactAt !== viewport) {
        await page.setViewportSize({ width: DOCS_SCREENSHOT_WIDTHS[viewport], height: 900 })
        await page.waitForTimeout(SETTLE_MS)
      }

      const target = path.join(out, file)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      // Scoped to the story root: `layout: 'fullscreen'` stretches the body to the viewport,
      // so a full-page shot pads short components with dead space.
      await page.locator('#storybook-root').screenshot({ path: target, animations: 'disabled' })
      console.info(`  ${file}  <-  ${storyId} (${interactAt ? `${interactAt} -> ` : ''}${viewport})`)
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
