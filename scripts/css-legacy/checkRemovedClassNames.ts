/* eslint-disable no-console */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

/**
 * Fails when a branch stops shipping a `Layer__` class name. Consumers style against these, and
 * nothing in their build tells them a name is gone.
 *
 * Both sides are measured the same way — the same pattern over the same file types — so a name that
 * moves between files, or into a `createLegacyClassNames` map, reads as kept. Only a name that
 * leaves the tree entirely is a removal, and only against the base: a name introduced and dropped
 * inside the branch never reached a consumer.
 */

const BASE_REF = process.env.BASE_REF ?? 'origin/main'
const ALLOWLIST_PATH = 'scripts/css-legacy/droppedClassNames.txt'

const CLASS_NAME = /Layer__[A-Za-z0-9_-]+/g

/*
 * Source only, never stylesheets: the break is a name leaving the DOM, and a name kept as a selector
 * in our own CSS while no element carries it is exactly the break that must not read as fine.
 * Tests, stories and mocks are excluded — a name a consumer could never have targeted.
 */
const PATHSPECS = ['*.ts', '*.tsx', ':!*.test.*', ':!*.stories.*', ':!src/msw/**', ':!src/testUtils/**']

function git(args: string[]) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
}

function readAllowlist() {
  if (!fs.existsSync(ALLOWLIST_PATH)) return new Set<string>()

  return new Set(
    fs.readFileSync(ALLOWLIST_PATH, 'utf8')
      .split('\n')
      .map(line => line.split('#')[0].trim())
      .filter(Boolean),
  )
}

/** Every name the tree still mentions, by the same measure applied to the removed lines. */
function shippedNames() {
  const output = git(['grep', '-h', '--untracked', '-oE', CLASS_NAME.source, '--', ...PATHSPECS])
  return new Set(output.split('\n').filter(Boolean))
}

/** Against the working tree, not HEAD, so an uncommitted removal is caught before it is pushed. */
function removedNames(mergeBase: string) {
  const diff = git(['diff', '--unified=0', mergeBase, '--', ...PATHSPECS])
  const removed = new Map<string, string>()
  let file = ''

  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/')) {
      file = line.slice('+++ b/'.length)
      continue
    }
    if (!line.startsWith('-') || line.startsWith('---')) continue

    for (const name of line.matchAll(CLASS_NAME)) {
      if (!removed.has(name[0])) removed.set(name[0], file)
    }
  }

  return removed
}

function main() {
  let mergeBase: string
  try {
    mergeBase = git(['merge-base', BASE_REF, 'HEAD']).trim()
  }
  catch {
    console.error(`Cannot resolve ${BASE_REF} — fetch it, or set BASE_REF, so the diff has a base.`)
    process.exit(1)
  }

  const shipped = shippedNames()
  const allowed = readAllowlist()

  const dropped = [...removedNames(mergeBase)]
    .filter(([name]) => !shipped.has(name) && !allowed.has(name))

  if (dropped.length > 0) {
    console.error('\nClass names this branch stops shipping:')
    for (const [name, file] of dropped.sort()) console.error(`  ${name}  (left ${file})`)
    console.error(
      '\nKeep each one — a createLegacyClassNames map beside the element, or `npm run css:rename`'
      + `\n— or accept the break by adding it to ${ALLOWLIST_PATH} with a reason.\n`,
    )
    process.exit(1)
  }

  console.log(`No class name is dropped against ${BASE_REF}.`)
}

main()
