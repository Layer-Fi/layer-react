import { execSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'

/**
 * Internal build step: produce the bundled type declarations (dist/index.d.ts).
 *
 * Invoked only via `npm run build:types`. The individual steps below are
 * intentionally NOT exposed as npm scripts so the build surface stays small.
 */

const env = {
  ...process.env,
  PATH: `${path.resolve('node_modules/.bin')}${path.delimiter}${process.env.PATH ?? ''}`,
}
const run = (command: string) => execSync(command, { stdio: 'inherit', env })

// 1. Emit per-file .d.ts into dist/.types (incremental disabled for idempotency).
run('tsc -p tsconfig.dts.json')
// 2. Rewrite tsconfig path aliases to relative paths so rollup can resolve them.
run('tsc-alias -p tsconfig.dts.json')
// 3. Roll the per-file declarations up into a single dist/index.d.ts.
run('rollup -c rollup.dts.config.mjs')
// 4. Drop the temporary per-file output.
rmSync('dist/.types', { recursive: true, force: true })
