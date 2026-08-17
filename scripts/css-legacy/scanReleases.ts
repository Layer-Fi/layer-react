/* eslint-disable no-console */
import { execFileSync } from 'node:child_process'
import { buildDomClassIndex, lookup } from './domClassIndex'

/** Class names that shipped in some release since v0.1.122 and are gone today. */

const FIRST_RELEASE = 122
const CLASS_PATTERN = 'Layer__[A-Za-z0-9_-]+'
const PATHSPECS = ['*.tsx', '*.ts', '*.scss']

function git(args: string[]) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 })
}

/** `git grep` exits non-zero when nothing matches, which is a valid empty result here. */
function grepClassNames(args: string[]) {
  try {
    return git(['grep', '-h', ...args]).split('\n').filter(Boolean)
  }
  catch {
    return []
  }
}

function releaseTags() {
  return git(['tag', '--list', 'v0.1.*'])
    .split('\n')
    .map(tag => tag.trim())
    .filter(tag => tag && !/alpha|beta|rc/.test(tag))
    .filter((tag) => {
      const patch = Number(tag.split('.')[2])
      return Number.isFinite(patch) && patch >= FIRST_RELEASE
    })
    .sort((a, b) => Number(a.split('.')[2]) - Number(b.split('.')[2]))
}

const isCompleteName = (name: string) => !/[_-]$/.test(name)

function classNamesAt(revision: string) {
  return new Set(grepClassNames(['-oE', CLASS_PATTERN, revision, '--', ...PATHSPECS]).filter(isCompleteName))
}

function buildCurrentMatcher() {
  const index = buildDomClassIndex('.')
  const scss = new Set(grepClassNames(['--untracked', '-oE', CLASS_PATTERN, '--', '*.scss']))

  return (name: string) => scss.has(name) || lookup(index, name).length > 0
}

function main() {
  const tags = releaseTags()
  const isStillEmitted = buildCurrentMatcher()

  const firstSeen = new Map<string, string>()
  const lastSeen = new Map<string, string>()

  for (const tag of tags) {
    for (const name of classNamesAt(tag)) {
      if (!firstSeen.has(name)) firstSeen.set(name, tag)
      lastSeen.set(name, tag)
    }
  }

  const dropped = [...lastSeen.keys()]
    .filter(name => !isStillEmitted(name))
    .map(name => ({ name, first: firstSeen.get(name)!, last: lastSeen.get(name)! }))

  const baseline = tags[0]
  const introducedAfterBaseline = dropped.filter(entry => entry.first !== baseline)

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ tags, dropped, introducedAfterBaseline }, null, 2))
    return
  }

  const newest = tags[tags.length - 1]
  const droppedByNewest = dropped.filter(entry => entry.last === newest)

  const byLastRelease = new Map<string, typeof dropped>()
  for (const entry of [...introducedAfterBaseline, ...droppedByNewest.filter(entry => entry.first === baseline)]) {
    if (!byLastRelease.has(entry.last)) byLastRelease.set(entry.last, [])
    byLastRelease.get(entry.last)!.push(entry)
  }

  console.log(`Scanned ${tags.length} releases, ${tags[0]} … ${tags[tags.length - 1]}.`)
  console.log(`${dropped.length} class names shipped once and are absent today.`)
  console.log(
    `${introducedAfterBaseline.length} of those never existed in ${baseline}, so a `
    + `${baseline}-versus-today diff cannot see them.`,
  )
  console.log(
    droppedByNewest.length > 0
      ? `\n${droppedByNewest.length} are dropped by the working tree since ${newest} — check these before publishing.\n`
      : `\nNothing present in ${newest} has been dropped by the working tree.\n`,
  )

  for (const [release, entries] of [...byLastRelease].sort(([a], [b]) =>
    Number(b.split('.')[2]) - Number(a.split('.')[2]),
  )) {
    console.log(`last shipped in ${release}  (${entries.length})`)
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      console.log(`  ${entry.name}  (since ${entry.first})`)
    }
    console.log('')
  }
}

main()

export { classNamesAt, releaseTags }
