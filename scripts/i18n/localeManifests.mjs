import fs from 'node:fs'
import path from 'node:path'

import { SOURCE_ROOT } from './keyOwnership.mjs'

const MANIFEST_DIR = path.join(SOURCE_ROOT, 'assets/locales')

export const SOURCE_LOCALE = 'en-US'
export const LOCALES = ['en-US', 'fr-CA']

const flattenTree = (node, prefix, flattened) => {
  for (const [segment, value] of Object.entries(node)) {
    const key = prefix ? `${prefix}.${segment}` : segment
    if (value && typeof value === 'object') flattenTree(value, key, flattened)
    else flattened[key] = value
  }
  return flattened
}

/** Every leaf of one locale, keyed as `namespace:dotted.key`. */
export const readLocale = (locale) => {
  const localeDir = path.join(MANIFEST_DIR, locale)
  const entries = {}

  for (const fileName of fs.readdirSync(localeDir).sort()) {
    if (!fileName.endsWith('.json')) continue
    const namespace = fileName.replace(/\.json$/, '')
    const tree = JSON.parse(fs.readFileSync(path.join(localeDir, fileName), 'utf8'))
    for (const [key, value] of Object.entries(flattenTree(tree, '', {}))) {
      entries[`${namespace}:${key}`] = value
    }
  }

  return entries
}
