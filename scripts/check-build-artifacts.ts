import fs from 'node:fs'
import pkg from '../package.json'

// Derived from package.json rather than listed, so adding an export without building it fails
// here instead of in someone else's install. Values only — `exports` keys are subpath specifiers.
function exportedPaths(node: unknown): string[] {
  if (typeof node === 'string') return [node]
  if (node === null || typeof node !== 'object') return []
  return Object.values(node).flatMap(exportedPaths)
}

// Resolved implicitly as a sibling of dist/index.css, so it appears in no `exports` entry.
const IMPLICIT_ARTIFACTS = ['dist/index.d.css.ts']

function declaredArtifacts(): string[] {
  return [...new Set([
    pkg.main,
    pkg.module,
    pkg.types,
    pkg.style,
    ...exportedPaths(pkg.exports),
    ...IMPLICIT_ARTIFACTS,
  ]
    .filter((value): value is string => typeof value === 'string')
    .map(value => value.replace(/^\.\//, '')))]
}

const missing = declaredArtifacts().filter((artifact) => {
  const isPresent = fs.existsSync(artifact) && fs.statSync(artifact).size > 0
  if (!isPresent) console.error(`::error::Missing or empty build artifact: ${artifact}`)
  return !isPresent
})

if (missing.length > 0) process.exit(1)

console.info('All expected build artifacts present.')
