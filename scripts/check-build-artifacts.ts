import fs from 'node:fs'
import pkg from '../package.json'

// Every path package.json points a consumer at. Derived rather than listed, so adding an export
// without building it fails here instead of at install time in someone else's app.
// Only the values: the keys of `exports` are subpath specifiers, not files on disk.
function exportedPaths(node: unknown): string[] {
  if (typeof node === 'string') return [node]
  if (node === null || typeof node !== 'object') return []
  return Object.values(node).flatMap(exportedPaths)
}

// TypeScript resolves this as a sibling of dist/index.css under `allowArbitraryExtensions`, so it
// appears in no `exports` entry and cannot be derived.
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
