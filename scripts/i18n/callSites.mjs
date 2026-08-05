/**
 * Finds every place the source names a translation key, paired with the English it declares.
 *
 * `t()` and `translationKey()` put the default in the next argument, but `tPlural`, `tConditional`
 * and `<Trans>` put theirs in an options object or a prop, and the extraction plugins in
 * `scripts/i18next/` expand those into `_one`/`_other`/`_context` variants. Those variants are what
 * end up in the manifest, so they are what has to be reported — comparing only the bare key lets a
 * conflict between two plural call sites through.
 */
import fs from 'node:fs'

import { KEY_PATTERN } from './keyGrammar.mjs'
import { isExempt, listSourceFiles } from './zones.mjs'

/** `t('key', 'Default')` and `translationKey('key', 'Default')`. */
const PLAIN_DEFAULT = new RegExp(String.raw`\b(?:t|translationKey)\(\s*(['"])(${KEY_PATTERN})\1\s*,\s*(['"])((?:[^\\]|\\.)*?)\3`, 'gs')
/** `tPlural(t, 'key', {…})` and `tConditional(t, 'key', {…})`, whose defaults live in the options. */
const HELPER_CALL = new RegExp(String.raw`\b(tPlural|tConditional)\(\s*t\s*,\s*(['"])(${KEY_PATTERN})\2\s*,`, 'g')
/** `<Trans i18nKey='key' … defaults='Default' />`. */
const TRANS = /<Trans\b[^>]*?/gs
/** Any key literal at all, including ones that declare no default. */
const ANY_KEY = new RegExp(String.raw`(['"])(${KEY_PATTERN})\1`, 'g')

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

/** A JSX attribute's string value, written either as `name='v'` or `name={'v'}`. */
const attribute = (tag, name) => {
  const match = tag.match(new RegExp(String.raw`\b${name}\s*=\s*(?:(['"])((?:[^\\]|\\.)*?)\1|\{\s*(['"])((?:[^\\]|\\.)*?)\3\s*\})`, 's'))
  return match ? (match[2] ?? match[4]) : undefined
}

/** Mirrors `scripts/i18next/pluralPlugin.ts`. */
const pluralVariants = (key, options) =>
  ['one', 'other']
    .filter(category => options.strings.has(category))
    .map(category => ({ key: `${key}_${category}`, defaultValue: options.strings.get(category) }))

/** Mirrors `scripts/i18next/conditionalPlugin.ts`, including its first-case-wins dedupe. */
const conditionalVariants = (key, options) => {
  const cases = propertiesOf(options.objects.get('cases') ?? '').strings
  const contexts = propertiesOf(options.objects.get('contexts') ?? '').strings
  const seen = new Set()
  const variants = []
  for (const [name, defaultValue] of cases) {
    const context = contexts.get(name)
    const variant = context ? `${key}_${context}` : key
    if (seen.has(variant)) continue
    seen.add(variant)
    variants.push({ key: variant, defaultValue })
  }
  return variants
}

/**
 * @returns {Array<{ file: string, key: string, defaultValue?: string, exempt: boolean, line: number }>}
 *   One entry per mention. `defaultValue` is absent when the site only references the key.
 */
export const collectCallSites = () => {
  const sites = []

  for (const file of listSourceFiles()) {
    const text = fs.readFileSync(file, 'utf8')
    const exempt = isExempt(file)
    const add = (key, defaultValue, index) =>
      sites.push({ file, key, defaultValue, exempt, line: lineOf(text, index) })

    for (const match of text.matchAll(PLAIN_DEFAULT)) add(match[2], match[4], match.index)

    for (const match of text.matchAll(HELPER_CALL)) {
      const [, helper, , key] = match
      const options = propertiesOf(readObject(text, match.index + match[0].length - 1))
      const variants = helper === 'tPlural'
        ? pluralVariants(key, options)
        : conditionalVariants(key, options)
      for (const variant of variants) add(variant.key, variant.defaultValue, match.index)
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
