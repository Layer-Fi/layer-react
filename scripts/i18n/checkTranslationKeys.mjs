/**
 * Guards the four ways the translation manifest goes wrong:
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

const PLURAL_CATEGORIES = ['zero', 'one', 'two', 'few', 'many', 'other']

const CATEGORIES = new Set([
  'action', 'banner', 'delete', 'disclaimer', 'empty', 'error', 'label', 'placeholder', 'prompt',
  'services', 'state', 'title', 'toast', 'tooltip', 'validation',
])

/** The owner is every segment before the category, so it may be dotted (`Tasks.TasksHeader`). */
const ownerOf = (key) => {
  const segments = key.slice(key.indexOf(':') + 1).split('.')
  const at = segments.findIndex(segment => CATEGORIES.has(segment))
  return at > 0 ? segments.slice(0, at).join('.') : undefined
}

const KEY = String.raw`[a-z][A-Za-z]*:[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*`

/** `t('key', 'Default')` and `translationKey('key', 'Default')`. */
const PLAIN_DEFAULT = new RegExp(String.raw`\b(?:t|translationKey)\(\s*(['"])(${KEY})\1\s*,\s*(['"])((?:[^\\]|\\.)*?)\3`, 'gs')
/** `tPlural(t, 'key', {…})` and `tConditional(t, 'key', {…})`, whose defaults live in the options. */
const HELPER_CALL = new RegExp(String.raw`\b(tPlural|tConditional)\(\s*t\s*,\s*(['"])(${KEY})\2\s*,`, 'g')
/** `<Trans i18nKey='key' … defaults='Default' />`. */
const TRANS = /<Trans\b[^>]*?/gs
const ANY_KEY = new RegExp(String.raw`(['"])(${KEY})\1`, 'g')

const lineOf = (text, index) => text.slice(0, index).split('\n').length

/** Text of the `{…}` object starting at or after `from`, brace-matched and quote-aware. */
const readObject = (text, from) => {
  const start = text.indexOf('{', from)
  if (start < 0) return ''
  let depth = 0
  let quote
  for (let at = start; at < text.length; at += 1) {
    const character = text[at]
    if (quote) {
      if (character === '\\') at += 1
      else if (character === quote) quote = undefined
      continue
    }
    if (character === '\'' || character === '"' || character === '`') quote = character
    else if (character === '{') depth += 1
    else if (character === '}') {
      depth -= 1
      if (depth === 0) return text.slice(start + 1, at)
    }
  }
  return ''
}

/** Depth-1 `name: 'value'` and `name: {…}` properties of an object body. */
const propertiesOf = (body) => {
  const strings = new Map()
  const objects = new Map()
  let depth = 0
  let quote
  let at = 0
  const readName = (index) => {
    const ahead = body.slice(index).match(/^\s*([A-Za-z_$][\w$]*)\s*:/)
    return ahead ? { name: ahead[1], after: index + ahead[0].length } : undefined
  }
  while (at < body.length) {
    const character = body[at]
    if (quote) {
      if (character === '\\') at += 1
      else if (character === quote) quote = undefined
      at += 1
      continue
    }
    if (character === '\'' || character === '"' || character === '`') { quote = character; at += 1; continue }
    if (character === '{' || character === '[' || character === '(') { depth += 1; at += 1; continue }
    if (character === '}' || character === ']' || character === ')') { depth -= 1; at += 1; continue }
    if (depth === 0) {
      const property = readName(at)
      if (property) {
        const value = body.slice(property.after).match(/^\s*(['"])((?:[^\\]|\\.)*?)\1/s)
        if (value) {
          strings.set(property.name, value[2])
          at = property.after + value[0].length
          continue
        }
        if (/^\s*\{/.test(body.slice(property.after))) {
          objects.set(property.name, readObject(body, property.after))
        }
        at = property.after
        continue
      }
    }
    at += 1
  }
  return { strings, objects }
}

const attribute = (tag, name) => {
  const match = tag.match(new RegExp(String.raw`\b${name}\s*=\s*(?:(['"])((?:[^\\]|\\.)*?)\1|\{\s*(['"])((?:[^\\]|\\.)*?)\3\s*\})`, 's'))
  return match ? (match[2] ?? match[4]) : undefined
}

/**
 * Every place a key is named, paired with the English it declares. `tPlural`, `tConditional` and
 * `<Trans>` put their copy in an options object or a prop, and the extraction plugins expand those
 * into `_one`/`_other`/`_context` variants — so the variants are what must be compared, or a
 * conflict between two plural call sites slips past.
 */
const collectCallSites = () => {
  const sites = []
  for (const file of listSourceFiles()) {
    const text = fs.readFileSync(file, 'utf8')
    const exempt = isExempt(file)
    const add = (key, defaultValue, index) =>
      sites.push({ file, key, defaultValue, exempt, line: lineOf(text, index) })

    for (const match of text.matchAll(PLAIN_DEFAULT)) add(match[2], match[4], match.index)

    for (const match of text.matchAll(HELPER_CALL)) {
      const [, helper, , key] = match
      const { strings, objects } = propertiesOf(readObject(text, match.index + match[0].length - 1))

      if (helper === 'tPlural') {
        for (const category of ['one', 'other']) {
          if (strings.has(category)) add(`${key}_${category}`, strings.get(category), match.index)
        }
        continue
      }

      // tConditional maps each case onto its `contexts` entry, or onto the bare key when absent.
      const cases = propertiesOf(objects.get('cases') ?? '').strings
      const contexts = propertiesOf(objects.get('contexts') ?? '').strings
      const seen = new Set()
      for (const [name, value] of cases) {
        const context = contexts.get(name)
        const variant = context ? `${key}_${context}` : key
        if (seen.has(variant)) continue
        seen.add(variant)
        add(variant, value, match.index)
      }
    }

    for (const match of text.matchAll(TRANS)) {
      const tag = text.slice(match.index, text.indexOf('>', match.index) + 1)
      const key = attribute(tag, 'i18nKey')
      const defaults = attribute(tag, 'defaults')
      if (!key || !defaults) continue
      // `count` makes i18next expand the key into plural categories.
      if (/\bcount\s*=/.test(tag)) {
        add(`${key}_one`, defaults, match.index)
        add(`${key}_other`, defaults, match.index)
      }
      else add(key, defaults, match.index)
    }

    for (const match of text.matchAll(ANY_KEY)) {
      sites.push({ file, key: match[2], exempt, line: lineOf(text, match.index) })
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

      // A locale may need a CLDR plural category English lacks — French `_many`. Only that:
      // the suffix must be a real category, and English must have the same base pluralized,
      // or an unrelated key whose leaf happens to end in `_word` would be waved through.
      const plural = key.match(/^(.*)_(zero|one|two|few|many|other)$/)
      const isLocaleOnlyPluralCategory = plural
        && PLURAL_CATEGORIES.some(category => sourceKeys.has(`${plural[1]}_${category}`))
      if (!isLocaleOnlyPluralCategory) fail(`${locale} has ${key}, which ${SOURCE_LOCALE} does not`)
    }
  }
}

/**
 * Release gate. Every string a stable build renders must already be translated, which needs both
 * halves of the pipeline to have run: extraction, so the key reached the manifest and therefore
 * Crowdin at all, and Crowdin itself, so `fr-CA` has a value rather than falling back to English.
 *
 * Reports which half is unfinished so the caller can dispatch the workflow that fixes it.
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
    for (const key of Object.keys(source)) {
      if (!(key in target) || String(target[key]).trim() === '') untranslated.push(`${locale} ${key}`)
    }
  }

  return { unextracted, untranslated }
}

const runReleaseGate = () => {
  const { unextracted, untranslated } = checkReadyForRelease()

  if (unextracted.length === 0 && untranslated.length === 0) {
    console.log('i18n: translations are ready for a stable release')
    return
  }

  if (unextracted.length > 0) {
    console.error(`\n${unextracted.length} key(s) used in code but absent from ${SOURCE_LOCALE}, so Crowdin never saw them:`)
    for (const key of unextracted.slice(0, 40)) console.error(`  ${key}`)
    if (unextracted.length > 40) console.error(`  …and ${unextracted.length - 40} more`)
  }

  if (untranslated.length > 0) {
    console.error(`\n${untranslated.length} key(s) missing or empty in a translated locale:`)
    for (const key of untranslated.slice(0, 40)) console.error(`  ${key}`)
    if (untranslated.length > 40) console.error(`  …and ${untranslated.length - 40} more`)
  }

  // Consumed by Release — Prepare to dispatch the workflow that can actually fix this.
  const remedy = unextracted.length > 0 ? 'extract' : 'crowdin'
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `ready=false\nremedy=${remedy}\n`)
  }
  console.error(`\nTranslations are not ready for a stable release (remedy: ${remedy}).`)
  process.exitCode = 1
}

const main = () => {
  if (process.argv.includes('--release')) {
    runReleaseGate()
    return
  }

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
