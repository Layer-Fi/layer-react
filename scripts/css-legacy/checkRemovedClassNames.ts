/* eslint-disable no-console */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { Node, Project, type SourceFile, SyntaxKind } from 'ts-morph'

/**
 * Fails when a branch stops shipping a `Layer__` class name. Consumers style against these, and
 * nothing in their build tells them a name is gone.
 *
 * Kept honest by what it refuses to count as still shipped: only string and template literals under
 * `src`, read from the syntax tree. A name surviving in a comment, in this script, in a story, or as
 * a selector in our own CSS while no element carries it is the break — not evidence against it.
 *
 * Only a name that leaves entirely is a removal, and only against the base: a name introduced and
 * dropped inside one branch never reached a consumer.
 */

const BASE_REF = process.env.BASE_REF ?? 'origin/main'
const ALLOWLIST_PATH = 'scripts/css-legacy/droppedClassNames.txt'

/** Zero-or-more, so the bare head of a template like `Layer__${name}` counts as a name too. */
const CLASS_NAME = /Layer__[A-Za-z0-9_-]*/g

const SOURCE_GLOBS = ['src/**/*.ts', 'src/**/*.tsx']

/** A name a consumer could never have targeted. */
const EXCLUDED = /\.(?:test|stories)\.[jt]sx?$|\/(?:msw|testUtils)\//

const isReviewed = (file: string) => /^src\/.*\.tsx?$/.test(file) && !EXCLUDED.test(file)

function git(args: string[]) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
}

function readAllowlist() {
  if (!fs.existsSync(ALLOWLIST_PATH)) return { allowed: new Set<string>(), unexplained: [] as string[] }

  const allowed = new Set<string>()
  const unexplained: string[] = []

  for (const line of fs.readFileSync(ALLOWLIST_PATH, 'utf8').split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue

    const [name, ...reason] = line.split('#')
    // The reason is the entry: it is what a reviewer weighs, so an entry without one is not accepted.
    if (reason.join('#').trim()) allowed.add(name.trim())
    else unexplained.push(name.trim())
  }

  return { allowed, unexplained }
}

/** A literal in a type position — `satisfies LegacyClassNameMapFor<'Layer__UI__Button'>` — renders nothing. */
const isInTypePosition = (node: Node) => Boolean(node.getFirstAncestor(Node.isTypeNode))

/**
 * Whole names and template prefixes are collected apart, because they are different claims. The
 * composer's own `startsWith('Layer__')` is a whole name; `Layer__${name}` in `Container` is a
 * prefix. Pooling them let that literal vouch for every prefix in the tree.
 */
function collectFrom(sourceFile: SourceFile, names: Set<string>, prefixes: Set<string>) {
  const addTo = (target: Set<string>) => (text: string) => {
    for (const match of text.matchAll(CLASS_NAME)) target.add(match[0])
  }
  const addName = addTo(names)
  const addPrefix = addTo(prefixes)

  for (const node of sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral)) {
    if (!isInTypePosition(node)) addName(node.getLiteralValue())
  }
  for (const node of sourceFile.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral)) {
    if (!isInTypePosition(node)) addName(node.getLiteralValue())
  }

  for (const node of sourceFile.getDescendantsOfKind(SyntaxKind.TemplateExpression)) {
    if (isInTypePosition(node)) continue

    addPrefix(node.getHead().getLiteralText())
    for (const span of node.getTemplateSpans()) addPrefix(span.getLiteral().getLiteralText())
  }
}

/** Read from the syntax tree, so a name mentioned only in a comment is not counted as shipped. */
function shippedNames() {
  const project = new Project({ skipFileDependencyResolution: true })
  project.addSourceFilesAtPaths(SOURCE_GLOBS)

  const names = new Set<string>()
  const prefixes = new Set<string>()

  for (const sourceFile of project.getSourceFiles()) {
    if (EXCLUDED.test(sourceFile.getFilePath())) continue
    collectFrom(sourceFile, names, prefixes)
  }

  /*
   * A prefix vouches only for itself, never for names starting with it: the bare `Layer__` head in
   * `Container` would otherwise vouch for every name in the package. A whole name removed while a
   * template still builds it therefore reads as dropped — a loud false positive, which is the safe
   * direction for this check, and one line in the allowlist settles it.
   */
  return {
    isShipped: (name: string, isPrefix: boolean) => isPrefix ? prefixes.has(name) : names.has(name),
  }
}

const isCommentLine = (line: string) => /^(?:\/\/|\/\*|\*)/.test(line.slice(1).trim())

/** Against the working tree, not HEAD, so an uncommitted removal is caught before it is pushed. */
function removedNames(mergeBase: string) {
  const diff = git(['diff', '--unified=0', mergeBase, '--', 'src'])
  const removed = new Map<string, string>()
  let file = ''

  for (const line of diff.split('\n')) {
    // A deleted file's post-image is `/dev/null`, so the pre-image path is the only one it has.
    // Anchored on the prefix git actually writes, so a removed line starting with `-- ` is content.
    if (line.startsWith('--- a/')) {
      file = line.slice('--- a/'.length)
      continue
    }
    if (line.startsWith('+++ b/')) {
      file = line.slice('+++ b/'.length)
      continue
    }
    if (line === '--- /dev/null' || line === '+++ /dev/null') continue
    if (!line.startsWith('-')) continue
    if (!isReviewed(file) || isCommentLine(line)) continue

    for (const match of line.matchAll(CLASS_NAME)) {
      // A name the line interpolates into is a prefix claim, not a whole name.
      const isPrefix = line.slice(match.index + match[0].length).startsWith('${')
      const key = `${match[0]}\u0000${isPrefix ? 'prefix' : 'name'}`
      if (!removed.has(key)) removed.set(key, file)
    }
  }

  return removed
}

const describe = (name: string, isPrefix: boolean) =>
  isPrefix ? `${name}…  (a prefix, and every name built from it)` : name

export function checkRemovedClassNames() {
  let mergeBase: string
  try {
    mergeBase = git(['merge-base', BASE_REF, 'HEAD']).trim()
  }
  catch {
    console.error(`Cannot resolve ${BASE_REF} — fetch it, or set BASE_REF, so the diff has a base.`)
    return false
  }

  const { allowed, unexplained } = readAllowlist()

  if (unexplained.length > 0) {
    console.error(`\n${ALLOWLIST_PATH} entries with no reason after \`#\`:`)
    for (const name of unexplained) console.error(`  ${name}`)
    console.error('\nA break with no stated reason is indistinguishable from a mistake.\n')
    return false
  }

  const { isShipped } = shippedNames()
  const dropped = [...removedNames(mergeBase)]
    .map(([key, file]) => {
      const [name, kind] = key.split('\u0000')
      return { name, isPrefix: kind === 'prefix', file }
    })
    .filter(({ name, isPrefix }) => !isShipped(name, isPrefix) && !allowed.has(name))

  if (dropped.length > 0) {
    console.error('\nClass names this branch stops shipping:')
    for (const { name, isPrefix, file } of dropped.sort((a, b) => a.name.localeCompare(b.name))) {
      console.error(`  ${describe(name, isPrefix)}  (left ${file})`)
    }
    console.error(
      '\nKeep each one — a createLegacyClassNames map beside the element, or `npm run css:rename`'
      + `\n— or accept the break by adding it to ${ALLOWLIST_PATH} with a reason.\n`,
    )
    return false
  }

  console.log(`No class name is dropped against ${BASE_REF}.`)
  return true
}
