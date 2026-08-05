/**
 * Guards the four ways the translation manifest goes wrong:
 *
 *  1. one key carrying two different English defaults — extraction keeps whichever call site it
 *     visits last, so the loser silently renders the other component's copy,
 *  2. a key filed under a namespace or owner that doesn't match the file using it,
 *  3. `en-US` and `fr-CA` drifting apart structurally,
 *  4. straight `'` in user-visible copy, which should be a typographic `’`.
 *
 * `--release` instead checks the pipeline has finished; see `runReleaseGate`. Scope is whatever the
 * extractor extracts, so tests and stories are excluded — `i18next.config.ts` ignores them.
 */
import fs from 'node:fs'

import { collectCallSites } from './callSites.mjs'
import { hasPluralFamilyIn, OWNER_EXEMPT_NAMESPACES, ownerOf, pluralCategoriesFor, splitPluralCategory } from './keyGrammar.mjs'
import { SHARED_NAMESPACES, ownershipFor } from './keyOwnership.mjs'
import { LOCALES, readLocale, SOURCE_LOCALE } from './localeManifests.mjs'

const checkConflictingDefaults = (sites, fail) => {
  const byKey = new Map()
  for (const site of sites) {
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
      for (const site of at) fail(`      ${site.file}${site.line ? `:${site.line}` : ''}`)
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

    const zone = ownershipFor(file)
    if (!zone || zone.grandfathered) continue

    if (!zone.allowsAnyDomain && namespace !== zone.namespace) {
      fail(`${file}:${line} uses '${key}' but may only use '${zone.namespace}:' or a shared namespace`)
      continue
    }

    if (namespace === zone.namespace && ownerOf(key) !== zone.owner) {
      fail(`${file}:${line} uses '${key}' but keys owned by this file must start with '${namespace}:${zone.owner}.'`)
    }
  }
}

/** U+0027 and U+02BC read as apostrophes but break search and look wrong beside U+2019. */
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
    const localeCategories = pluralCategoriesFor(locale)

    for (const key of sourceKeys) {
      if (!(key in target)) fail(`${locale} is missing ${key}`)
    }
    for (const key of Object.keys(target)) {
      if (sourceKeys.has(key)) continue

      // English has no `_many`, but French does; that form is extra, not drift.
      const plural = splitPluralCategory(key)
      const isLocaleOnlyForm = plural
        && localeCategories.has(plural.category)
        && hasPluralFamilyIn(plural.base, sourceKeys)
      if (!isLocaleOnlyForm) fail(`${locale} has ${key}, which ${SOURCE_LOCALE} does not`)
    }
  }
}

/** Both halves of the pipeline must have run: extraction reaching the manifest, then Crowdin. */
const checkReadyForRelease = async () => {
  const source = readLocale(SOURCE_LOCALE)
  const sourceKeys = new Set(Object.keys(source))

  // Extraction emits a plural form per configured locale, so a category English does not use is
  // absent from en-US by design. Any category English does use must be there.
  const sourceCategories = pluralCategoriesFor(SOURCE_LOCALE)
  const isForeignPluralForm = (key) => {
    const plural = splitPluralCategory(key)
    return Boolean(plural) && !sourceCategories.has(plural.category)
  }

  const unextracted = [...new Set(
    (await collectCallSites())
      .filter(site => !sourceKeys.has(site.key) && !isForeignPluralForm(site.key))
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

const runReleaseGate = async () => {
  const { unextracted, untranslated } = await checkReadyForRelease()

  if (unextracted.length === 0 && untranslated.length === 0) {
    console.log('i18n: translations are ready for a stable release')
    return
  }

  report(`key(s) used in code but absent from ${SOURCE_LOCALE}, so Crowdin never saw them:`, unextracted)
  report('key(s) missing or empty in a translated locale:', untranslated)

  // Release — Prepare reads this to dispatch the workflow that fixes it.
  const remedy = unextracted.length > 0 ? 'extract' : 'crowdin'
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `ready=false\nremedy=${remedy}\n`)
  }
  console.error(`\nTranslations are not ready for a stable release (remedy: ${remedy}).`)
  process.exitCode = 1
}

const runChecks = async () => {
  const failures = []
  const fail = message => failures.push(message)
  const sites = await collectCallSites()

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

if (process.argv.includes('--release')) await runReleaseGate()
else await runChecks()
