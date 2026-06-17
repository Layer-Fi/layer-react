import { type ChildProcess, execSync, spawn } from 'node:child_process'
import path from 'node:path'

/**
 * Internal dev step: emit type declarations once, then keep them in sync.
 *
 * Invoked only via `npm run dev:types`. The individual steps below are
 * intentionally NOT exposed as npm scripts.
 */

const env = {
  ...process.env,
  PATH: `${path.resolve('node_modules/.bin')}${path.delimiter}${process.env.PATH ?? ''}`,
}

// Initial one-shot emit + alias rewrite so dist has declarations immediately.
execSync('tsc -p tsconfig.build.json', { stdio: 'inherit', env })
execSync('tsc-alias -p tsconfig.build.json', { stdio: 'inherit', env })

// Then run two watchers concurrently:
//  - tsc re-emits .d.ts on source changes
//  - chokidar re-runs tsc-alias whenever an emitted .d.ts changes
const children: ChildProcess[] = []
const watch = (command: string) => {
  children.push(spawn(command, { stdio: 'inherit', shell: true, env }))
}
watch('tsc -p tsconfig.build.json --watch --preserveWatchOutput')
watch("chokidar 'dist/**/*.d.ts' --silent -c 'tsc-alias -p tsconfig.build.json'")

const shutdown = () => {
  for (const child of children) child.kill()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
