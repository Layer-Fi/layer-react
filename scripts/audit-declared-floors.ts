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
  optionalDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

// Only `^`/`~`/exact are reducible to a single floor. Anything else (unions, npm: aliases, tags)
// is reported rather than silently dropped, so a range we cannot pin never reads as "covered".
const FLOOR = /^[~^]?(\d+\.\d+\.\d+(?:-[\w.]+)?)$/

// Optionals are installed for the platforms they support, so a vulnerable optional floor reaches
// consumers exactly like a regular one.
const declared = { ...pkg.dependencies, ...pkg.optionalDependencies, ...pkg.peerDependencies }
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
  .map(([name, v]) => ({
    name,
    range: v.range,
    severity: v.severity,
    advisories: v.via
      .filter((via): via is { title: string, url: string } => typeof via === 'object')
      .map(({ title, url }) => ({ title, url })),
  }))

// The audit workflow folds this into the one Slack report, so the findings have to outlive the
// process rather than only reaching the log.
const outPath = process.argv[2]
if (outPath) {
  writeFileSync(outPath, JSON.stringify({ audited: Object.keys(floors).length, unpinnable, findings }))
}

console.info(`\nAudited ${Object.keys(floors).length} declared floors.`)

if (findings.length === 0 && unpinnable.length === 0) {
  console.info('No advisories affect the lowest versions our ranges admit.')
  process.exit(0)
}

if (findings.length > 0) {
  console.error('\nDeclared ranges admit vulnerable versions:\n')
  for (const finding of findings) {
    console.error(`  ${finding.name} ${finding.range} (${finding.severity})`)
    console.error(finding.advisories.map(({ title, url }) => `      ${title} — ${url}`).join('\n'))
  }
  console.error(
    `\nRaise the floor in package.json past each vulnerable range. Bumping the lockfile alone `
    + `fixes CI and leaves consumers exposed.\n`,
  )
}

// Failing rather than noting it: a range this cannot reduce is a range nothing above audits, and
// passing would report the whole surface as covered when part of it was never checked.
if (unpinnable.length > 0) {
  console.error(
    `\nThese ranges have no single floor to audit: ${unpinnable.join(', ')}\n`
    + `Narrow them to \`^\`/\`~\`/exact, or teach this script to reduce the form they use.\n`,
  )
}

process.exit(1)
