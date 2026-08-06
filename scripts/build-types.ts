import { execSync } from 'node:child_process'
import { copyFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

/** Builds the bundled type declarations (dist/index.d.ts). Run via `npm run build:types`. */

const env = {
  ...process.env,
  PATH: `${path.resolve('node_modules/.bin')}${path.delimiter}${process.env.PATH ?? ''}`,
}
const run = (command: string) => execSync(command, { stdio: 'inherit', env })

// Emit per-file .d.ts. tsconfig.dts.json keeps `incremental: false` so this
// re-emits every run — step 4 deletes the output, which a cached run would skip.
run('tsc -p tsconfig.dts.json')
// Rewrite path aliases to relative paths so rollup can resolve them.
run('tsc-alias -p tsconfig.dts.json')
run('rollup -c rollup.dts.config.mjs')
rmSync('dist/.types', { recursive: true, force: true })

// Identical content — the extension is what tells TypeScript which module system to assume. One
// flat .d.ts for both conditions reads as CJS types to an ESM consumer and breaks default imports.
copyFileSync('dist/index.d.ts', 'dist/esm/index.d.mts')
copyFileSync('dist/index.d.ts', 'dist/cjs/index.d.cts')

// Content is irrelevant; tsc only needs the CSS import to resolve under `allowArbitraryExtensions`.
writeFileSync('dist/index.d.css.ts', 'export {}\n')
