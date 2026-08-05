import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright'
import { serveStatic } from './serve-static'

// Tests the artifact consumers install, not the source tree. `vitest` and `build.yml` both read
// from the repo, so a missing `exports` condition, a file left out of `files`, a top-level `window`
// reference, or a declaration file that only resolves under one module mode all pass CI today.

const FIXTURES_ROOT = 'consumer-fixtures'
const PREVIEW_PORT = 6008

type Fixture = {
  name: string
  /** Built output to load in a browser after `verify` passes, relative to the fixture. */
  browserCheck?: { dist: string, readySelector: string }
}

const FIXTURES: Fixture[] = [
  { name: 'vite-esm', browserCheck: { dist: 'dist', readySelector: '[data-testid="fixture-ready"]' } },
  { name: 'cjs-require' },
  { name: 'ssr-node' },
]

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

  const [result] = JSON.parse(output) as [{
    filename: string
    files: { path: string }[]
    unpackedSize: number
  }]

  return {
    tarball: path.resolve(outDir, result.filename),
    entries: result.files.map(file => `package/${file.path}`),
    unpackedSize: result.unpackedSize,
  }
}

function checkTarball(entries: string[]) {
  const problems: string[] = []

  for (const required of REQUIRED_FILES) {
    if (!entries.includes(required)) problems.push(`missing: ${required}`)
  }

  for (const entry of entries) {
    const matched = FORBIDDEN_PATTERNS.find(pattern => pattern.test(entry))
    if (matched) problems.push(`should not be published: ${entry}`)
  }

  return problems
}

async function checkInBrowser(fixture: Fixture, cwd: string) {
  const { dist, readySelector } = fixture.browserCheck!
  const { server, origin } = await serveStatic(path.join(cwd, dist), PREVIEW_PORT)
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const failures: string[] = []

  page.on('pageerror', error => failures.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text().split('\n')[0])
  })

  try {
    await page.goto(origin)
    await page.waitForSelector(readySelector, { timeout: 30_000 })
    await page.waitForTimeout(750)
  }
  catch (error) {
    failures.push(error instanceof Error ? error.message.split('\n')[0] : String(error))
  }
  finally {
    await browser.close()
    server.close()
  }

  return failures
}

async function main() {
  const requested = process.argv
    .flatMap((arg, index) => (arg === '--fixture' ? [process.argv[index + 1]] : []))
    .filter(Boolean)
  const selected = requested.length > 0
    ? FIXTURES.filter(fixture => requested.includes(fixture.name))
    : FIXTURES

  const unknown = requested.filter(name => !FIXTURES.some(fixture => fixture.name === name))
  if (unknown.length > 0) {
    console.error(`Unknown fixture(s): ${unknown.join(', ')}`)
    console.error(`Available: ${FIXTURES.map(fixture => fixture.name).join(', ')}`)
    process.exit(1)
  }

  if (!process.argv.includes('--skip-build')) {
    console.info('Building the library...')
    run('npm', ['run', 'build:clean'], process.cwd())
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'layer-consumer-'))
  console.info(`\nPacking into ${workDir}`)
  const { tarball, entries, unpackedSize } = pack(workDir)
  console.info(`  ${path.basename(tarball)} — ${entries.length} files, ${Math.round(unpackedSize / 1024)} kB unpacked`)

  const tarballProblems = checkTarball(entries)
  if (tarballProblems.length > 0) {
    console.error(`\nTarball contents are wrong:\n`)
    for (const problem of tarballProblems) console.error(`  ${problem}`)
    process.exit(1)
  }
  console.info('  contents OK')

  const failed: string[] = []

  for (const fixture of selected) {
    const cwd = path.join(FIXTURES_ROOT, fixture.name)
    console.info(`\n=== ${fixture.name} ===`)

    try {
      // `--no-package-lock` keeps fixture lockfiles out of the repo, and `--no-save` on the
      // tarball keeps npm from writing its temp path into the fixture's manifest.
      run('npm', ['install', '--no-package-lock', '--no-audit', '--no-fund'], cwd)
      run('npm', ['install', '--no-package-lock', '--no-save', '--no-audit', '--no-fund', tarball], cwd)
      run('npm', ['run', 'verify'], cwd)

      if (fixture.browserCheck) {
        const failures = await checkInBrowser(fixture, cwd)
        if (failures.length > 0) {
          console.error(`  browser check failed:\n    ${failures.slice(0, 5).join('\n    ')}`)
          failed.push(fixture.name)
          continue
        }
        console.info('  browser check OK')
      }
    }
    catch {
      failed.push(fixture.name)
    }
  }

  fs.rmSync(workDir, { recursive: true, force: true })

  if (failed.length > 0) {
    console.error(`\n${failed.length} of ${selected.length} consumer fixture(s) failed: ${failed.join(', ')}`)
    process.exit(1)
  }

  console.info(`\nAll ${selected.length} consumer fixture(s) installed and ran the packed tarball.`)
}

void main()
