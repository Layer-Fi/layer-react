import { execSync } from 'node:child_process'
import { rmSync } from 'node:fs'
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
// Bundle the per-file declarations into a single dist/index.d.ts.
run('rollup -c rollup.dts.config.mjs')
// Drop the temporary per-file output.
rmSync('dist/.types', { recursive: true, force: true })
