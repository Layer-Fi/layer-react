/**
 * Guards the three ways the translation manifest goes wrong:
 *
 *  1. one key carrying two different English defaults (the extractor keeps whichever call site it
 *     visits last, so the losing component silently renders the other component's copy),
 *  2. a key filed under a namespace or owner that doesn't match the file it's used from,
 *  3. `en-US` and `fr-CA` drifting apart structurally,
 *  4. straight `'` in user-visible copy, which should always be a typographic `’`.
 */
import fs from 'node:fs'

import {
  isExempt,
  listSourceFiles,
  LOCALES,
  readLocale,
  SHARED_NAMESPACES,
  SOURCE_LOCALE,
  zoneFor,
} from './zones.mjs'

/** `usStates` is a data table of 53 state names, declared once outside any component. */
const OWNER_EXEMPT_NAMESPACES = ['usStates']

const KEY_WITH_DEFAULT = /(?:\bt|translationKey|tPlural|tConditional)\(\s*(?:t\s*,\s*)?(['"])([a-z][A-Za-z]*:[A-Za-z0-9_.]+)\1\s*,\s*(['"])((?:[^\\]|\\.)*?)\3/gs
const ANY_KEY = /(['"])([a-z][A-Za-z]*:[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)\1/g

const lineOf = (text, index) => text.slice(0, index).split('\n').length

const collectCallSites = () => {
  const sites = []
  for (const file of listSourceFiles()) {
    if (isExempt(file)) continue
    const text = fs.readFileSync(file, 'utf8')

    for (const match of text.matchAll(KEY_WITH_DEFAULT)) {
      sites.push({ file, key: match[2], defaultValue: match[4], line: lineOf(text, match.index) })
    }
    for (const match of text.matchAll(ANY_KEY)) {
      sites.push({ file, key: match[2], line: lineOf(text, match.index) })
    }
  }
  return sites
}

const checkConflictingDefaults = (sites, fail) => {
  const byKey = new Map()
  for (const site of sites) {
    if (site.defaultValue === undefined) continue
    if (!byKey.has(site.key)) byKey.set(site.key, new Map())
    const defaults = byKey.get(site.key)
    if (!defaults.has(site.defaultValue)) defaults.set(site.defaultValue, [])
    defaults.get(site.defaultValue).push(site)
  }

  for (const [key, defaults] of byKey) {
    if (defaults.size < 2) continue
    fail(`${key} has ${defaults.size} different English defaults:`)
    for (const [value, at] of defaults) {
      fail(`    ${JSON.stringify(value)}`)
      for (const site of at) fail(`      ${site.file}:${site.line}`)
    }
  }
}

const checkKeyLocation = (sites, fail) => {
  const seen = new Set()
  for (const { file, key, line } of sites) {
    const marker = `${file}:${key}`
    if (seen.has(marker)) continue
    seen.add(marker)

    const separator = key.indexOf(':')
    const namespace = key.slice(0, separator)
    if (SHARED_NAMESPACES.includes(namespace) || OWNER_EXEMPT_NAMESPACES.includes(namespace)) continue

    const zone = zoneFor(file)
    if (!zone || zone.grandfathered) continue

    if (!zone.allowsAnyDomain && namespace !== zone.namespace) {
      fail(`${file}:${line} uses '${key}' but may only use '${zone.namespace}:' or a shared namespace`)
      continue
    }

    const owner = key.slice(separator + 1).split('.')[0]
    // A view may reach into a domain namespace, and then the owner is that domain's component.
    if (namespace === zone.namespace && owner !== zone.owner) {
      fail(`${file}:${line} uses '${key}' but keys owned by this file must start with '${namespace}:${zone.owner}.'`)
    }
  }
}

/** U+0027 and U+02BC both read as an apostrophe but break search and look wrong beside U+2019. */
const checkApostrophes = (fail) => {
  for (const locale of LOCALES) {
    for (const [key, value] of Object.entries(readLocale(locale))) {
      if (typeof value === 'string' && /['ʼ]/.test(value)) {
        fail(`${locale} ${key} uses a straight apostrophe, expected ’: ${JSON.stringify(value)}`)
      }
    }
  }
}

const checkLocaleParity = (fail) => {
  const source = readLocale(SOURCE_LOCALE)
  const sourceKeys = new Set(Object.keys(source))

  for (const locale of LOCALES) {
    if (locale === SOURCE_LOCALE) continue
    const target = readLocale(locale)

    for (const key of Object.keys(source)) {
      if (!(key in target)) fail(`${locale} is missing ${key}`)
    }
    for (const key of Object.keys(target)) {
      if (sourceKeys.has(key)) continue
      // Locales may carry plural categories that English does not have (fr `_many`).
      const base = key.replace(/_[a-z]+$/, '')
      const hasEnglishSibling = [...sourceKeys].some(other => other.startsWith(`${base}_`))
      if (!hasEnglishSibling) fail(`${locale} has ${key}, which ${SOURCE_LOCALE} does not`)
    }
  }
}

const main = () => {
  const failures = []
  const fail = message => failures.push(message)
  const sites = collectCallSites()

  checkConflictingDefaults(sites, fail)
  checkKeyLocation(sites, fail)
  checkLocaleParity(fail)
  checkApostrophes(fail)

  if (failures.length === 0) {
    console.log(`i18n: ok (${new Set(sites.map(site => site.key)).size} keys)`)
    return
  }

  console.error('i18n check failed:\n')
  for (const message of failures) console.error(`  ${message}`)
  console.error(`\n${failures.length} problem(s). See src/assets/locales/SKILL.md.`)
  process.exitCode = 1
}

main()
