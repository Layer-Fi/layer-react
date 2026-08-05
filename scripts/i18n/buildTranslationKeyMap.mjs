/**
 * Derives the `<namespace>:<Owner>.<category>.<key>` name for every translation key at every call
 * site and writes the old -> new map consumed by `migrateTranslationKeys.mjs`.
 *
 * Run once for the restructure; kept in-tree as the record of what moved.
 */
import fs from 'node:fs'
import path from 'node:path'

import {
  isExempt,
  listSourceFiles,
  readLocale,
  SHARED_NAMESPACES,
  SOURCE_LOCALE,
  zoneFor,
} from './zones.mjs'

const MAP_PATH = 'scripts/i18n/keyMigrationMap.json'

const CATEGORIES = new Set([
  'action', 'banner', 'delete', 'disclaimer', 'empty', 'error', 'label', 'placeholder', 'prompt',
  'services', 'state', 'title', 'toast', 'tooltip', 'validation',
])

/** Keys with no category segment to reuse. */
const CATEGORY_OVERRIDES = {
  'overview:chart_type': 'label',
}

const KEY_LITERAL = /(["'])((?:[a-z][A-Za-z]*):(?:[A-Za-z0-9_]+)(?:\.[A-Za-z0-9_]+)*)\1/g

/**
 * i18next plural categories and `tConditional` contexts hang off a base key as `_suffix`, and the
 * bare base is never itself a JSON key — `tPlural(t, 'ns:label.x')` only ever writes `x_one`/`x_other`.
 * So a key literal in code is legitimate if the JSON has it outright or has any `_`-suffixed variant.
 */
const callableKeys = (jsonKeys) => {
  const callable = new Set(jsonKeys)
  for (const key of jsonKeys) {
    for (let at = key.lastIndexOf('_'); at > 0; at = key.lastIndexOf('_', at - 1)) {
      callable.add(key.slice(0, at))
    }
  }
  return callable
}

/** Every JSON key that the given base key owns: itself plus its `_suffix` variants. */
const variantsOf = (base, jsonKeys) =>
  jsonKeys.filter(key => key === base || key.startsWith(`${base}_`))

const renameKey = ({ oldKey, zone }) => {
  const separator = oldKey.indexOf(':')
  const namespace = oldKey.slice(0, separator)
  const rest = oldKey.slice(separator + 1)

  if (SHARED_NAMESPACES.includes(namespace)) return oldKey

  const segments = rest.split('.')
  let category
  let leaf
  if (CATEGORIES.has(segments[0])) {
    category = segments[0]
    leaf = segments.slice(1)
  }
  else if (CATEGORIES.has(segments[1])) {
    // A sub-namespace that the owner segment now makes redundant, e.g. `recordTransaction.title.x`.
    category = segments[1]
    leaf = segments.slice(2)
  }
  else if (CATEGORY_OVERRIDES[oldKey]) {
    category = CATEGORY_OVERRIDES[oldKey]
    leaf = segments
  }
  else {
    return undefined
  }

  const targetNamespace = zone.grandfathered ? namespace : zone.namespace
  return `${targetNamespace}:${zone.owner}.${category}.${leaf.join('.')}`
}

const main = () => {
  const source = readLocale(SOURCE_LOCALE)
  const jsonKeys = Object.keys(source)
  const callable = callableKeys(jsonKeys)

  const sites = new Map()
  const unzoned = []
  const unknown = new Map()

  for (const file of listSourceFiles()) {
    if (isExempt(file)) continue
    const text = fs.readFileSync(file, 'utf8')
    for (const match of text.matchAll(KEY_LITERAL)) {
      const literal = match[2]
      if (!callable.has(literal)) continue
      const zone = zoneFor(file)
      if (!zone) {
        unzoned.push({ file, key: literal })
        continue
      }
      const newKey = renameKey({ oldKey: literal, zone })
      if (!newKey) {
        unknown.set(literal, file)
        continue
      }
      sites.set(`${file}::${literal}`, newKey)
    }
  }

  const splits = new Map()
  for (const [site, newKey] of sites) {
    const oldKey = site.slice(site.indexOf('::') + 2)
    if (!splits.has(oldKey)) splits.set(oldKey, new Set())
    splits.get(oldKey).add(newKey)
  }

  const live = new Set([...splits.keys()].flatMap(base => variantsOf(base, jsonKeys)))
  const dead = jsonKeys.filter(key => !live.has(key))

  fs.mkdirSync(path.dirname(MAP_PATH), { recursive: true })
  fs.writeFileSync(MAP_PATH, `${JSON.stringify(Object.fromEntries([...sites].sort()), null, 2)}\n`)

  console.log(`call sites mapped: ${sites.size}`)
  console.log(`keys renamed:      ${[...splits.keys()].filter(key => !SHARED_NAMESPACES.includes(key.split(':')[0])).length}`)
  console.log(`keys split:        ${[...splits.values()].filter(set => set.size > 1).length}`)
  for (const [oldKey, newKeys] of splits) {
    if (newKeys.size > 1) console.log(`  ${oldKey}\n    -> ${[...newKeys].join('\n    -> ')}`)
  }
  console.log(`\nno zone (${unzoned.length}):`)
  for (const { file, key } of unzoned) console.log(`  ${key}  <- ${file}`)
  console.log(`\nno category (${unknown.size}):`)
  for (const [key, file] of unknown) console.log(`  ${key}  <- ${file}`)
  console.log(`\ndead JSON keys, dropped (${dead.length}):`)
  for (const key of dead) console.log(`  ${key}`)
}

main()
