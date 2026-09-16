import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright'
import { serveStatic } from './serve-static'

// Tests the artifact consumers install, not the source tree: every other check reads the repo,
// so a broken published package passes them.

const FIXTURES_ROOT = 'consumer-fixtures'
const PREVIEW_PORT = 6008
const READY_SELECTOR = '[data-testid="fixture-ready"]'

// `dist` is the built output to load in a browser once `verify` passes, relative to the fixture.
const FIXTURES = [
  { name: 'vite-esm', dist: 'dist' },
  { name: 'vite-esm-treeshake' },
  { name: 'cjs-require' },
  { name: 'ssr-node' },
] as const

// Present in the tarball, or the package is broken on arrival.
const REQUIRED_FILES = [
  'package/dist/esm/index.mjs',
  'package/dist/cjs/index.cjs',
  'package/dist/index.d.ts',
  'package/dist/index.css',
]

// Absent from the tarball. Shipping these bloats every consumer install and leaks internals.
const FORBIDDEN_PATTERNS = [
  /^package\/src\//,
  /\.stories\.[jt]sx?$/,
  /\.test\.[jt]sx?$/,
  /\.scratch\./,
  /^package\/\.storybook\//,
  // Build scratch: `build:exports` consumes and deletes these, so one here means a partial build.
  /^package\/dist\/\.manifest-/,
]

function run(command: string, args: string[], cwd: string) {
  execFileSync(command, args, { cwd, stdio: 'inherit' })
}

function pack(outDir: string) {
  // `--ignore-scripts` because the build already ran; without it `prepack` rebuilds from scratch.
  const output = execFileSync(
    'npm',
    ['pack', '--ignore-scripts', '--json', '--pack-destination', outDir],
    { cwd: process.cwd(), encoding: 'utf8' },
  )

  const [result] = JSON.parse(output) as
    [{ filename: string, files: { path: string }[], unpackedSize: number }]

  return {
    tarball: path.resolve(outDir, result.filename),
    entries: result.files.map(file => `package/${file.path}`),
    unpackedSize: result.unpackedSize,
  }
}

function checkTarball(entries: string[]) {
  return [
    ...REQUIRED_FILES.filter(required => !entries.includes(required)).map(f => `missing: ${f}`),
    ...entries.filter(entry => FORBIDDEN_PATTERNS.some(pattern => pattern.test(entry)))
      .map(entry => `should not be published: ${entry}`),
  ]
}

async function checkInBrowser(dist: string, cwd: string) {
  const { server, origin } = await serveStatic(path.join(cwd, dist), PREVIEW_PORT)
  const failures: string[] = []
  let browser

  try {
    // Inside the try, or a launch failure leaves the server holding the port.
    browser = await chromium.launch()
    const page = await browser.newPage()

    page.on('pageerror', error => failures.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') failures.push(message.text().split('\n')[0])
    })

    await page.goto(origin)
    await page.waitForSelector(READY_SELECTOR, { timeout: 30_000 })
    await page.waitForTimeout(750)
  }
  catch (error) {
    failures.push(error instanceof Error ? error.message.split('\n')[0] : String(error))
  }
  finally {
    await browser?.close()
    server.close()
  }

  return failures
}

async function runFixture(fixture: typeof FIXTURES[number], tarball: string) {
  const cwd = path.join(FIXTURES_ROOT, fixture.name)
  console.info(`\n=== ${fixture.name} ===`)

  try {
    // `--no-package-lock` keeps lockfiles out of the repo; `--no-save` keeps the tarball's temp
    // path out of the fixture manifest.
    run('npm', ['install', '--no-package-lock', '--no-audit', '--no-fund'], cwd)
    run('npm', ['install', '--no-package-lock', '--no-save', '--no-audit', '--no-fund', tarball], cwd)
    run('npm', ['run', 'verify'], cwd)
  }
  catch {
    return false
  }

  if (!('dist' in fixture)) return true

  const failures = await checkInBrowser(fixture.dist, cwd)
  if (failures.length > 0) {
    console.error(`  browser check failed:\n    ${failures.slice(0, 5).join('\n    ')}`)
    return false
  }

  console.info('  browser check OK')
  return true
}

// Returns a status rather than exiting: `process.exit()` would skip the `finally` cleanup.
async function main() {
  const requested = process.argv.filter((_, index) => process.argv[index - 1] === '--fixture')
  const unknown = requested.filter(name => !FIXTURES.some(fixture => fixture.name === name))
  if (unknown.length > 0) {
    console.error(`Unknown fixture(s): ${unknown.join(', ')}`)
    console.error(`Available: ${FIXTURES.map(fixture => fixture.name).join(', ')}`)
    return false
  }

  const selected = requested.length > 0
    ? FIXTURES.filter(fixture => requested.includes(fixture.name))
    : FIXTURES

  if (!process.argv.includes('--skip-build')) {
    console.info('Building the library...')
    run('npm', ['run', 'build:clean'], process.cwd())
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'layer-consumer-'))
  try {
    console.info(`\nPacking into ${workDir}`)
    const { tarball, entries, unpackedSize } = pack(workDir)
    console.info(`  ${path.basename(tarball)} — ${entries.length} files, ${Math.round(unpackedSize / 1024)} kB unpacked`)

    const problems = checkTarball(entries)
    if (problems.length > 0) {
      console.error('\nTarball contents are wrong:\n')
      for (const problem of problems) console.error(`  ${problem}`)
      return false
    }
    console.info('  contents OK')

    const failed: string[] = []
    for (const fixture of selected) {
      if (!await runFixture(fixture, tarball)) failed.push(fixture.name)
    }

    if (failed.length > 0) {
      console.error(`\n${failed.length} of ${selected.length} consumer fixture(s) failed: ${failed.join(', ')}`)
      return false
    }

    console.info(`\nAll ${selected.length} consumer fixture(s) installed and ran the packed tarball.`)
    return true
  }
  finally {
    fs.rmSync(workDir, { recursive: true, force: true })
  }
}

void main().then((ok) => { process.exitCode = ok ? 0 : 1 })
