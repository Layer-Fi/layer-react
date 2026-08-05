/**
 * Guards the four ways the translation manifest goes wrong:
 *
 *  1. one key carrying two different English defaults (the extractor keeps whichever call site it
 *     visits last, so the losing component silently renders the other component's copy),
 *  2. a key filed under a namespace or owner that doesn't match the file it's used from,
 *  3. `en-US` and `fr-CA` drifting apart structurally,
 *  4. straight `'` in user-visible copy, which should always be a typographic `’`.
 *
 * With `--release`, instead checks that the translation pipeline has finished — see
 * `runReleaseGate`. Run as `npm run i18n:check` / `npm run i18n:check-release`.
 */
import fs from 'node:fs'

import { collectCallSites } from './callSites.mjs'
import { OWNER_EXEMPT_NAMESPACES, ownerOf, PLURAL_CATEGORIES, splitPluralCategory } from './keyGrammar.mjs'
import { LOCALES, readLocale, SHARED_NAMESPACES, SOURCE_LOCALE, zoneFor } from './zones.mjs'

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
  for (const { file, key, line, exempt } of sites) {
    // Tests and stories are not owned by a zone, but their copy still must not conflict.
    if (exempt) continue
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

    // A view may reach into a domain namespace, and then the owner is that domain's component.
    if (namespace === zone.namespace && ownerOf(key) !== zone.owner) {
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
  const sourceKeys = new Set(Object.keys(readLocale(SOURCE_LOCALE)))

  for (const locale of LOCALES) {
    if (locale === SOURCE_LOCALE) continue
    const target = readLocale(locale)

    for (const key of sourceKeys) {
      if (!(key in target)) fail(`${locale} is missing ${key}`)
    }
    for (const key of Object.keys(target)) {
      if (sourceKeys.has(key)) continue

      // A locale may need a CLDR plural category English lacks — French `_many`. Only that:
      // the suffix must be a real category, and English must have the same base pluralized,
      // or an unrelated key whose leaf happens to end in `_word` would be waved through.
      const plural = splitPluralCategory(key)
      const isLocaleOnlyPluralCategory = plural
        && PLURAL_CATEGORIES.some(category => sourceKeys.has(`${plural.base}_${category}`))
      if (!isLocaleOnlyPluralCategory) fail(`${locale} has ${key}, which ${SOURCE_LOCALE} does not`)
    }
  }
}

/**
 * A stable build must not render English through the fallback, which needs both halves of the
 * pipeline to have run: extraction, so the key reached the manifest and therefore Crowdin at all,
 * and Crowdin itself, so the locale has a value.
 */
const checkReadyForRelease = () => {
  const source = readLocale(SOURCE_LOCALE)
  const sourceKeys = new Set(Object.keys(source))

  const unextracted = [...new Set(
    collectCallSites()
      .filter(site => site.defaultValue !== undefined && !sourceKeys.has(site.key))
      .map(site => site.key),
  )].sort()

  const untranslated = []
  for (const locale of LOCALES) {
    if (locale === SOURCE_LOCALE) continue
    const target = readLocale(locale)
    for (const key of sourceKeys) {
      if (!(key in target) || String(target[key]).trim() === '') untranslated.push(`${locale} ${key}`)
    }
  }

  return { unextracted, untranslated }
}

const report = (heading, keys) => {
  if (keys.length === 0) return
  console.error(`\n${keys.length} ${heading}`)
  for (const key of keys.slice(0, 40)) console.error(`  ${key}`)
  if (keys.length > 40) console.error(`  …and ${keys.length - 40} more`)
}

const runReleaseGate = () => {
  const { unextracted, untranslated } = checkReadyForRelease()

  if (unextracted.length === 0 && untranslated.length === 0) {
    console.log('i18n: translations are ready for a stable release')
    return
  }

  report(`key(s) used in code but absent from ${SOURCE_LOCALE}, so Crowdin never saw them:`, unextracted)
  report('key(s) missing or empty in a translated locale:', untranslated)

  // Consumed by Release — Prepare to dispatch the workflow that can actually fix this.
  const remedy = unextracted.length > 0 ? 'extract' : 'crowdin'
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `ready=false\nremedy=${remedy}\n`)
  }
  console.error(`\nTranslations are not ready for a stable release (remedy: ${remedy}).`)
  process.exitCode = 1
}

const runChecks = () => {
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

if (process.argv.includes('--release')) runReleaseGate()
else runChecks()
