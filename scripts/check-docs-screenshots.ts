import fs from 'node:fs'
import { DOCS_SCREENSHOTS } from './docs-screenshots.manifest'
import { DOCS_SCREENSHOT_TAG } from '../.storybook/tags'

const INDEX_PATH = 'storybook-static/index.json'

if (!fs.existsSync(INDEX_PATH)) {
  console.error(`${INDEX_PATH} not found. Run \`npm run storybook:build\` first.`)
  process.exit(1)
}

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8')) as {
  entries: Record<string, { tags?: string[] }>
}
const known = new Set(Object.keys(index.entries))

const missing = DOCS_SCREENSHOTS.filter(({ storyId }) => !known.has(storyId))

const seen = new Map<string, string[]>()
for (const { out, storyId } of DOCS_SCREENSHOTS) {
  seen.set(out, [...(seen.get(out) ?? []), storyId])
}
const duplicates = [...seen].filter(([, ids]) => ids.length > 1)

// Tag and manifest must agree in both directions or the sidebar filter lies.
const inManifest = new Set(DOCS_SCREENSHOTS.map(({ storyId }) => storyId))
const tagged = Object.entries(index.entries)
  .filter(([, entry]) => entry.tags?.includes(DOCS_SCREENSHOT_TAG))
  .map(([id]) => id)
const untagged = DOCS_SCREENSHOTS
  .filter(({ storyId }) => known.has(storyId) && !index.entries[storyId].tags?.includes(DOCS_SCREENSHOT_TAG))
  .map(({ storyId }) => storyId)
const unlisted = tagged.filter(id => !inManifest.has(id))

if (missing.length === 0 && duplicates.length === 0 && untagged.length === 0 && unlisted.length === 0) {
  console.info(`All ${DOCS_SCREENSHOTS.length} documented stories resolve and carry the \`${DOCS_SCREENSHOT_TAG}\` tag.`)
  process.exit(0)
}

if (missing.length > 0) {
  console.error(`${missing.length} manifest entr(ies) point at a story that no longer exists:\n`)
  for (const { storyId, page } of missing) {
    console.error(`  ${storyId}  (documents ${page})`)
  }
  console.error('\nUpdate scripts/docs-screenshots.manifest.ts, or the docs image will silently go stale.\n')
}

if (untagged.length > 0) {
  console.error(`${untagged.length} manifest entr(ies) are missing the \`${DOCS_SCREENSHOT_TAG}\` tag:\n`)
  for (const storyId of untagged) console.error(`  ${storyId}`)
  console.error(`\nAdd \`tags: ['${DOCS_SCREENSHOT_TAG}']\` to the story so it shows up under Storybook's tag filter.\n`)
}

if (unlisted.length > 0) {
  console.error(`${unlisted.length} story(ies) are tagged \`${DOCS_SCREENSHOT_TAG}\` but absent from the manifest:\n`)
  for (const storyId of unlisted) console.error(`  ${storyId}`)
  console.error('\nEither add a manifest entry or drop the tag.\n')
}

if (duplicates.length > 0) {
  console.error(`${duplicates.length} output path(s) claimed by more than one story:\n`)
  for (const [out, ids] of duplicates) {
    console.error(`  ${out}  <-  ${ids.join(', ')}`)
  }
  console.error('')
}

process.exit(1)
