import fs from 'node:fs'
import path from 'node:path'

const HOOKS_ROOT = 'src/hooks/api'
const MSW_ROOT = 'src/msw/api'
const ALLOWLIST_PATH = 'src/msw/unmocked-endpoints.json'

const METHOD_FILES = new Set(['get.ts', 'post.ts', 'patch.ts', 'put.ts', 'delete.ts'])

function collectMethodFiles(root: string) {
  const found = new Set<string>()

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      }
      else if (METHOD_FILES.has(entry.name)) {
        found.add(path.relative(root, full).split(path.sep).join('/'))
      }
    }
  }

  walk(root)
  return found
}

const hookFiles = collectMethodFiles(HOOKS_ROOT)
const mswFiles = collectMethodFiles(MSW_ROOT)

const allowlist: string[] = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8')) as string[]
const allowed = new Set(allowlist)

const missing = [...hookFiles].filter(file => !mswFiles.has(file)).sort()
const unexpected = missing.filter(file => !allowed.has(file))
// An allowlisted endpoint that now has a handler must leave the list, so it can never be re-added.
const stale = allowlist.filter(file => !missing.includes(file)).sort()

if (unexpected.length === 0 && stale.length === 0) {
  console.info(`All ${hookFiles.size - allowlist.length} API hooks have an MSW handler (${allowlist.length} allowlisted).`)
  process.exit(0)
}

if (unexpected.length > 0) {
  console.error(`Missing MSW handler for ${unexpected.length} endpoint(s):\n`)
  for (const file of unexpected) {
    console.error(`  ${HOOKS_ROOT}/${file}  ->  add ${MSW_ROOT}/${file}`)
  }
  console.error(`\nEvery new API hook needs a mock at the mirrored path. ${ALLOWLIST_PATH} covers`)
  console.error('endpoints that predate this check and is closed to new entries.\n')
}

if (stale.length > 0) {
  console.error(`${stale.length} allowlisted endpoint(s) now have a handler. Remove them from ${ALLOWLIST_PATH}:\n`)
  for (const file of stale) {
    console.error(`  ${file}`)
  }
  console.error('')
}

process.exit(1)
