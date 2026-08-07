import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

// Consumers resolve our declared ranges, not our lockfile, so `npm audit` on the committed lock
// says nothing about their exposure. A lockfile-only Dependabot bump patches CI and leaves the
// published floor vulnerable. This audits the floors themselves: the worst tree a consumer can
// legally resolve from what we publish.

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

// Only `^`/`~`/exact are reducible to a single floor. Anything else (unions, npm: aliases, tags)
// is reported rather than silently dropped, so a range we cannot pin never reads as "covered".
const FLOOR = /^[~^]?(\d+\.\d+\.\d+(?:-[\w.]+)?)$/

const declared = { ...pkg.dependencies, ...pkg.peerDependencies }
const floors: Record<string, string> = {}
const unpinnable: string[] = []

for (const [name, range] of Object.entries(declared)) {
  const match = FLOOR.exec(range.trim())
  if (match) floors[name] = match[1]
  else unpinnable.push(`${name}@${range}`)
}

const scratch = mkdtempSync(path.join(tmpdir(), 'floor-audit-'))
writeFileSync(
  path.join(scratch, 'package.json'),
  JSON.stringify({ name: 'floor-audit', version: '1.0.0', private: true, dependencies: floors }),
)

// `--package-lock-only` resolves the full transitive tree from the registry without downloading
// tarballs; the audit needs the tree, not the files.
execFileSync('npm', ['install', '--package-lock-only', '--no-audit', '--no-fund'], {
  cwd: scratch,
  stdio: 'inherit',
})

let report: { vulnerabilities?: Record<string, { severity: string, via: unknown[], range: string }> }
try {
  report = JSON.parse(
    execFileSync('npm', ['audit', '--json'], { cwd: scratch, encoding: 'utf8' }),
  )
}
catch (error) {
  // npm audit exits non-zero when it finds anything, with the JSON still on stdout.
  const stdout = (error as { stdout?: string }).stdout
  if (!stdout) throw error
  report = JSON.parse(stdout)
}

const findings = Object.entries(report.vulnerabilities ?? {})
  .filter(([, v]) => v.via.some(via => typeof via === 'object'))

console.info(`\nAudited ${Object.keys(floors).length} declared floors.`)
if (unpinnable.length > 0) {
  console.info(`Not reducible to a floor, audit them by hand: ${unpinnable.join(', ')}`)
}

if (findings.length === 0) {
  console.info('No advisories affect the lowest versions our ranges admit.')
  process.exit(0)
}

console.error('\nDeclared ranges admit vulnerable versions:\n')
for (const [name, v] of findings) {
  const titles = v.via
    .filter((via): via is { title: string, url: string } => typeof via === 'object')
    .map(via => `      ${via.title} — ${via.url}`)
  console.error(`  ${name} ${v.range} (${v.severity})`)
  console.error(titles.join('\n'))
}
console.error(
  `\nRaise the floor in package.json past each vulnerable range. Bumping the lockfile alone `
  + `fixes CI and leaves consumers exposed.\n`,
)
process.exit(1)
