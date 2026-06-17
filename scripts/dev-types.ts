import { type ChildProcess, execSync, spawn } from 'node:child_process'
import path from 'node:path'

/** Emits type declarations, then keeps them in sync. Run via `npm run dev:types`. */

const BIN = path.resolve('node_modules/.bin')
const env = {
  ...process.env,
  // Resolve local bins (and commands they spawn, e.g. chokidar's `-c tsc-alias`).
  PATH: `${BIN}${path.delimiter}${process.env.PATH ?? ''}`,
}

// Initial emit + alias rewrite so dist has declarations immediately.
execSync('tsc -p tsconfig.build.json', { stdio: 'inherit', env })
execSync('tsc-alias -p tsconfig.build.json', { stdio: 'inherit', env })

// Watchers: tsc re-emits on source change; chokidar re-runs tsc-alias on .d.ts
// change. Spawn directly (no shell) so each child is the real process to signal.
const children: ChildProcess[] = []
const watch = (bin: string, args: string[]) => {
  children.push(spawn(path.join(BIN, bin), args, { stdio: 'inherit', env }))
}
watch('tsc', ['-p', 'tsconfig.build.json', '--watch', '--preserveWatchOutput'])
watch('chokidar', ['dist/**/*.d.ts', '--silent', '-c', 'tsc-alias -p tsconfig.build.json'])

// Signal each child, then exit once they've exited (force-exit as a fallback).
let shuttingDown = false
const shutdown = () => {
  if (shuttingDown) return
  shuttingDown = true

  const alive = children.filter(child => child.exitCode === null && !child.killed)
  if (alive.length === 0) {
    process.exit(0)
  }

  let remaining = alive.length
  for (const child of alive) {
    child.once('exit', () => {
      remaining -= 1
      if (remaining === 0) process.exit(0)
    })
    child.kill('SIGTERM')
  }

  setTimeout(() => process.exit(0), 2000).unref()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
