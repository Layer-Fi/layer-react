/**
 * Every place the source declares a translation key, from the real extractor rather than a second
 * copy of its parser.
 *
 * `findKeys` returns a deduplicated map, which cannot show a key declared twice with different
 * English. `onKeySubmitted` fires per submission before deduplication and `onLoad` gives the file;
 * extraction is sequential, so pairing them attributes each key correctly.
 */
import fs from 'node:fs'
import path from 'node:path'

import { findKeys } from 'i18next-cli'

import { splitPluralCategory } from './keyGrammar.mjs'

const CONFIG_PATH = path.resolve('i18next.config.ts')

const QUIET = { log: () => {}, info: () => {}, warn: () => {}, error: () => {}, debug: () => {}, success: () => {} }

/**
 * Extraction reports the key, not its position. For an expanded variant (`…_one`) the source holds
 * the base key. `from` walks repeats forward so two declarations don't both report the first.
 */
const findKeyLiteral = (text, key, from = 0) => {
  const candidates = [key]
  const plural = splitPluralCategory(key)
  if (plural) candidates.push(plural.base)
  const lastUnderscore = key.lastIndexOf('_')
  if (lastUnderscore > 0) candidates.push(key.slice(0, lastUnderscore))

  let best
  for (const candidate of candidates) {
    for (const quote of ['\'', '"', '`']) {
      const at = text.indexOf(`${quote}${candidate}${quote}`, from)
      if (at >= 0 && (best === undefined || at < best.at)) best = { at, length: candidate.length + 2 }
    }
  }
  if (!best) return undefined
  return { line: text.slice(0, best.at).split('\n').length, next: best.at + best.length }
}

/** One entry per declaration, including duplicates — that is the point. */
export const collectCallSites = async () => {
  const config = (await import(CONFIG_PATH)).default

  const submissions = []
  let currentFile
  const recorder = {
    name: 'record-call-sites',
    onLoad: (code, filePath) => {
      currentFile = filePath
      return code
    },
    onKeySubmitted: (extracted) => {
      // i18next-cli falls back to the key itself when a call declares no default: a reference, not
      // a declaration.
      if (!extracted.explicitDefault && extracted.defaultValue === extracted.key) return
      submissions.push({
        file: currentFile,
        key: `${extracted.ns}:${extracted.key}`,
        defaultValue: extracted.defaultValue,
      })
    },
  }

  await findKeys({ ...config, plugins: [...(config.plugins ?? []), recorder] }, QUIET)

  const sources = new Map()
  const cursors = new Map()
  return submissions.map((submission) => {
    if (!sources.has(submission.file)) sources.set(submission.file, fs.readFileSync(submission.file, 'utf8'))
    const cursor = `${submission.file}\t${submission.key}`
    const found = findKeyLiteral(sources.get(submission.file), submission.key, cursors.get(cursor) ?? 0)
    if (found) cursors.set(cursor, found.next)
    return { ...submission, line: found?.line }
  })
}
