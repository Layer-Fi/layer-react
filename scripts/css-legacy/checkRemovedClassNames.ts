/* eslint-disable no-console */
import { execFileSync } from 'node:child_process'
import { Node, Project, type SourceFile, SyntaxKind } from 'ts-morph'

/**
 * Fails when a branch stops shipping a `Layer__` class name. Consumers style against these, and
 * nothing in their build tells them a name is gone — this check is that signal. It is deliberately
 * not a merge gate: dropping a name is sometimes right, and the point is that it be a decision
 * rather than a surprise.
 *
 * Kept honest by what it refuses to count as still shipped: only string and template literals under
 * `src`, read from the syntax tree. A name surviving in a comment, in this script, in a story, or as
 * a selector in our own CSS while no element carries it is the break — not evidence against it.
 *
 * Only a name that leaves entirely is a removal, and only against the base: a name introduced and
 * dropped inside one branch never reached a consumer.
 */

const BASE_REF = process.env.BASE_REF ?? 'origin/main'

/** Zero-or-more, so the bare head of a template like `Layer__${name}` counts as a name too. */
const CLASS_NAME = /Layer__[A-Za-z0-9_-]*/g

const SOURCE_GLOBS = ['src/**/*.ts', 'src/**/*.tsx']

/** A name a consumer could never have targeted. */
const EXCLUDED = /\.(?:test|stories)\.[jt]sx?$|\/(?:msw|testUtils)\//

const isReviewed = (file: string) => /^src\/.*\.tsx?$/.test(file) && !EXCLUDED.test(file)

function git(args: string[]) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
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
   * direction for a check that reports rather than blocks.
   */
  return {
    isShipped: (name: string, isPrefix: boolean) => isPrefix ? prefixes.has(name) : names.has(name),
  }
}

const isCommentLine = (line: string) => /^(?:\/\/|\/\*|\*)/.test(line.slice(1).trim())

type Removal = { name: string, isPrefix: boolean, file: string, withFile: boolean }

/** Against the working tree, not HEAD, so an uncommitted removal is caught before it is pushed. */
function removedNames(mergeBase: string) {
  const diff = git(['diff', '--unified=0', mergeBase, '--', 'src'])
  const removed = new Map<string, Removal>()
  let file = ''
  let isDeletedFile = false

  for (const line of diff.split('\n')) {
    if (line.startsWith('diff --git ')) {
      isDeletedFile = false
      continue
    }
    // Deleting the whole file leaves nothing to keep the name on, so it is reported as one deletion.
    if (line.startsWith('deleted file mode')) {
      isDeletedFile = true
      continue
    }
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
      const key = `${match[0]}\u0000${isPrefix}`
      if (!removed.has(key)) removed.set(key, { name: match[0], isPrefix, file, withFile: isDeletedFile })
    }
  }

  return [...removed.values()]
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

  const { isShipped } = shippedNames()
  const dropped = removedNames(mergeBase)
    .filter(({ name, isPrefix }) => !isShipped(name, isPrefix))

  const withDeletedFile = new Map<string, string[]>()
  const fromSurvivingFile = dropped.filter(({ name, isPrefix, file, withFile }) => {
    if (!withFile) return true

    withDeletedFile.set(file, [...withDeletedFile.get(file) ?? [], describe(name, isPrefix)])
    return false
  })

  if (withDeletedFile.size > 0) {
    console.error('\nFiles deleted, and the names that went with them:')
    for (const [file, names] of [...withDeletedFile].sort()) {
      console.error(`  ${file}\n    ${names.sort().join(', ')}`)
    }
    console.error('\nNothing is left to carry these — the element is gone, so the names go with it.\n')
  }

  if (fromSurvivingFile.length > 0) {
    console.error('\nClass names this branch stops shipping:')
    for (const { name, isPrefix, file } of fromSurvivingFile.sort((a, b) => a.name.localeCompare(b.name))) {
      console.error(`  ${describe(name, isPrefix)}  (left ${file})`)
    }
    console.error(
      '\nKeep each one with a createLegacyClassNames map beside the element, or `npm run css:rename`'
      + '\n— or drop it knowingly, and say so in the PR.\n',
    )
  }

  if (withDeletedFile.size > 0 || fromSurvivingFile.length > 0) return false

  console.log(`No class name is dropped against ${BASE_REF}.`)
  return true
}
