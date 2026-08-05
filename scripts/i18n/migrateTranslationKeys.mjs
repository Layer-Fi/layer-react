/**
 * Applies `keyMigrationMap.json` to every call site and to both locale trees at once, so `fr-CA`
 * keeps its translations and stays structurally identical to `en-US`.
 *
 * One-time migration: it deliberately rewrites the generated locale JSON that the translations
 * SKILL tells you never to hand-edit. Kept in-tree as the record of what moved.
 */
import fs from 'node:fs'
import path from 'node:path'

import { listSourceFiles, LOCALES, LOCALES_DIR, readLocale, SOURCE_LOCALE } from './zones.mjs'

const MAP_PATH = 'scripts/i18n/keyMigrationMap.json'

const escapeForRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Old key -> the new keys it becomes, one per owning call site. */
const aggregate = (sites) => {
  const byOldKey = new Map()
  const byFile = new Map()
  for (const [site, newKey] of Object.entries(sites)) {
    const separator = site.indexOf('::')
    const file = site.slice(0, separator)
    const oldKey = site.slice(separator + 2)

    if (!byOldKey.has(oldKey)) byOldKey.set(oldKey, new Set())
    byOldKey.get(oldKey).add(newKey)

    if (!byFile.has(file)) byFile.set(file, new Map())
    byFile.get(file).set(oldKey, newKey)
  }
  return { byOldKey, byFile }
}

const rewriteCallSites = (byFile) => {
  let replaced = 0
  for (const [file, renames] of byFile) {
    const before = fs.readFileSync(file, 'utf8')
    let after = before
    // Longest first so `x_one` can never be rewritten by the rule for `x`.
    for (const oldKey of [...renames.keys()].sort((a, b) => b.length - a.length)) {
      const literal = new RegExp(`(['"\`])${escapeForRegExp(oldKey)}\\1`, 'g')
      after = after.replace(literal, (_, quote) => `${quote}${renames.get(oldKey)}${quote}`)
    }
    if (after !== before) {
      fs.writeFileSync(file, after)
      replaced += 1
    }
  }
  return replaced
}

/**
 * Resolves the new names for one locale key, carrying any i18next plural category or
 * `tConditional` context suffix across the rename.
 */
const rename = (key, byOldKey) => {
  if (byOldKey.has(key)) return [...byOldKey.get(key)]
  for (let at = key.lastIndexOf('_'); at > 0; at = key.lastIndexOf('_', at - 1)) {
    const base = key.slice(0, at)
    if (byOldKey.has(base)) {
      const suffix = key.slice(at)
      return [...byOldKey.get(base)].map(newKey => `${newKey}${suffix}`)
    }
  }
  return []
}

const nest = (entries) => {
  const root = {}
  for (const [key, value] of entries) {
    const segments = key.split('.')
    let node = root
    for (const segment of segments.slice(0, -1)) {
      node[segment] ??= {}
      node = node[segment]
    }
    node[segments.at(-1)] = value
  }
  return root
}

const sortDeep = (node) => {
  if (!node || typeof node !== 'object') return node
  return Object.fromEntries(
    Object.keys(node).sort().map(key => [key, sortDeep(node[key])]),
  )
}

const rewriteLocale = (locale, byOldKey) => {
  const source = readLocale(locale)
  const byNamespace = new Map()
  const dropped = []

  for (const [oldKey, value] of Object.entries(source)) {
    const newKeys = rename(oldKey, byOldKey)
    if (newKeys.length === 0) {
      dropped.push(oldKey)
      continue
    }
    for (const newKey of newKeys) {
      const separator = newKey.indexOf(':')
      const namespace = newKey.slice(0, separator)
      if (!byNamespace.has(namespace)) byNamespace.set(namespace, [])
      byNamespace.get(namespace).push([newKey.slice(separator + 1), value])
    }
  }

  const dir = path.join(LOCALES_DIR, locale)
  for (const file of fs.readdirSync(dir)) {
    if (file.endsWith('.json')) fs.unlinkSync(path.join(dir, file))
  }

  const namespaces = [...byNamespace.keys()].sort()
  for (const namespace of namespaces) {
    const tree = sortDeep(nest(byNamespace.get(namespace)))
    fs.writeFileSync(path.join(dir, `${namespace}.json`), `${JSON.stringify(tree, null, 2)}\n`)
  }

  const exports = namespaces
    .map(namespace => `export { default as ${namespace} } from './${namespace}.json'`)
    .join('\n')
  fs.writeFileSync(path.join(dir, 'index.ts'), `${exports}\n`)

  return { namespaces, dropped, keys: [...byNamespace.values()].reduce((total, list) => total + list.length, 0) }
}

const main = () => {
  const sites = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'))
  const { byOldKey, byFile } = aggregate(sites)

  const files = rewriteCallSites(byFile)
  console.log(`rewrote ${files} source files`)

  for (const locale of LOCALES) {
    const { namespaces, dropped, keys } = rewriteLocale(locale, byOldKey)
    console.log(`${locale}: ${keys} keys across ${namespaces.length} namespaces, ${dropped.length} dropped`)
    if (locale === SOURCE_LOCALE) for (const key of dropped) console.log(`  dropped ${key}`)
  }

  const retired = /(['"`])(trips|vehicles|mileageTracking|chartOfAccounts|categorizationRules|callBookings|stripe|landingPage|overview):[A-Za-z0-9_.]+\1/
  const stale = listSourceFiles().filter(file => retired.test(fs.readFileSync(file, 'utf8')))
  if (stale.length > 0) console.log(`\nWARNING retired namespace still referenced in:\n  ${stale.join('\n  ')}`)
}

main()
