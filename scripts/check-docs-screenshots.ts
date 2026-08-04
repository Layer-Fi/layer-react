import fs from 'node:fs'
import { DOCS_SCREENSHOTS } from './docs-screenshots.manifest'

const INDEX_PATH = 'storybook-static/index.json'

if (!fs.existsSync(INDEX_PATH)) {
  console.error(`${INDEX_PATH} not found. Run \`npm run storybook:build\` first.`)
  process.exit(1)
}

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8')) as { entries: Record<string, unknown> }
const known = new Set(Object.keys(index.entries))

const missing = DOCS_SCREENSHOTS.filter(({ storyId }) => !known.has(storyId))

const seen = new Map<string, string[]>()
for (const { out, storyId } of DOCS_SCREENSHOTS) {
  seen.set(out, [...(seen.get(out) ?? []), storyId])
}
const duplicates = [...seen].filter(([, ids]) => ids.length > 1)

if (missing.length === 0 && duplicates.length === 0) {
  console.info(`All ${DOCS_SCREENSHOTS.length} documented stories resolve.`)
  process.exit(0)
}

if (missing.length > 0) {
  console.error(`${missing.length} manifest entr(ies) point at a story that no longer exists:\n`)
  for (const { storyId, page } of missing) {
    console.error(`  ${storyId}  (documents ${page})`)
  }
  console.error('\nUpdate scripts/docs-screenshots.manifest.ts, or the docs image will silently go stale.\n')
}

if (duplicates.length > 0) {
  console.error(`${duplicates.length} output path(s) claimed by more than one story:\n`)
  for (const [out, ids] of duplicates) {
    console.error(`  ${out}  <-  ${ids.join(', ')}`)
  }
  console.error('')
}

process.exit(1)
