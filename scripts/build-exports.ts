/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'

import { type PublicExport, readPublicExports } from './publicExports'

const OUT = 'dist/exports'
const MANIFESTS = { esm: 'dist/.manifest-esm.json', cjs: 'dist/.manifest-cjs.json' }

type Manifest = Record<string, string>

function readManifest(file: string): Manifest {
  if (!fs.existsSync(file)) {
    throw new Error(`${file} is missing — run \`vite build\` before generating exports.`)
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Manifest
}

function namedList(names: string[]) {
  return names.join(', ')
}

/**
 * `dist/exports/<Name>.mjs` is the stable public address for a subpath. It re-exports from the
 * per-module tree, so internal paths never become API and stay free to move — the same layering
 * `react-aria-components` uses (`dist/exports/Button.mjs` over `dist/private/Button.mjs`).
 *
 * Values only: this file is executed as JavaScript, so `export type` (TypeScript-only syntax)
 * cannot appear here or Node/bundlers fail to parse it. Type-only names are covered separately by
 * `typeShim`'s `.d.mts` file.
 */
function esmShim(entry: PublicExport, target: string) {
  const from = `../esm/${target}`
  // A type-only module still needs a loadable file, or the subpath 404s at runtime.
  const line = entry.values.length > 0 ? `export { ${namedList(entry.values)} } from '${from}'` : 'export {}'
  return `${line}\n`
}

/**
 * Re-exported with getters rather than copied values, so live bindings and the `__esModule` flag
 * survive. Copying would also break `exports` mutated after first load.
 */
function cjsShim(entry: PublicExport, target: string) {
  const from = `../cjs/modules/${target}`
  return [
    '\'use strict\'',
    '',
    `const target = require('${from}')`,
    '',
    'Object.defineProperty(exports, \'__esModule\', { value: true })',
    ...entry.values.map(name =>
      `Object.defineProperty(exports, '${name}', { enumerable: true, get: () => target.${name} })`,
    ),
    '',
  ].join('\n')
}

/**
 * Types come from the rolled-up `dist/index.d.ts` that the `.` entry already publishes, reached
 * through the per-condition copies so `attw` sees a consistent module kind on both sides. No second
 * declaration build is needed.
 */
function typeShim(entry: PublicExport, condition: 'mts' | 'cts') {
  const from = condition === 'mts' ? '../esm/index.mjs' : '../cjs/index.cjs'
  const lines = []
  if (entry.values.length > 0) lines.push(`export { ${namedList(entry.values)} } from '${from}'`)
  if (entry.types.length > 0) lines.push(`export type { ${namedList(entry.types)} } from '${from}'`)
  return `${lines.join('\n')}\n`
}

function main() {
  const exports = readPublicExports()
  const manifests = { esm: readManifest(MANIFESTS.esm), cjs: readManifest(MANIFESTS.cjs) }

  fs.rmSync(OUT, { recursive: true, force: true })
  fs.mkdirSync(OUT, { recursive: true })

  const unresolved: string[] = []

  for (const entry of exports) {
    const esmTarget = manifests.esm[entry.module]
    const cjsTarget = manifests.cjs[entry.module]

    if (!esmTarget || !cjsTarget) {
      unresolved.push(`${entry.name} (${entry.module})`)
      continue
    }

    fs.writeFileSync(path.join(OUT, `${entry.name}.mjs`), esmShim(entry, esmTarget))
    fs.writeFileSync(path.join(OUT, `${entry.name}.cjs`), cjsShim(entry, cjsTarget))
    fs.writeFileSync(path.join(OUT, `${entry.name}.d.mts`), typeShim(entry, 'mts'))
    fs.writeFileSync(path.join(OUT, `${entry.name}.d.cts`), typeShim(entry, 'cts'))
  }

  if (unresolved.length > 0) {
    console.error('::error::No built module for these public exports:')
    for (const name of unresolved) console.error(`  ${name}`)
    process.exit(1)
  }

  for (const file of Object.values(MANIFESTS)) fs.rmSync(file, { force: true })

  console.log(`✓ Generated ${exports.length} subpath entries → ${OUT}`)
}

main()
