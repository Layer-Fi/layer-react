import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const [oldSourceDir, newSourceDir, translationDir] = process.argv.slice(2)

if (!oldSourceDir || !newSourceDir || !translationDir) {
  console.error('Usage: node scripts/i18next/scaffoldTranslationsFromSourceDiff.mjs <old-source-dir> <new-source-dir> <translation-dir>')
  process.exit(1)
}

const readJsonOrEmpty = async (filePath) => {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'))
  } catch (error) {
    if (error && error.code === 'ENOENT') return {}
    throw error
  }
}

const isPlainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

// Additions scaffold "", changes blank stale translations, removals drop them.
const scaffold = (oldSource, newSource, translation) => {
  const translationObject = isPlainObject(translation) ? translation : {}
  const oldObject = isPlainObject(oldSource) ? oldSource : {}

  const result = {}

  for (const [key, newValue] of Object.entries(newSource)) {
    const oldValue = oldObject[key]
    const translated = translationObject[key]

    if (isPlainObject(newValue)) {
      const section = scaffold(oldValue, newValue, translated)
      if (Object.keys(section).length > 0) result[key] = section
      continue
    }

    if (!(key in oldObject)) {
      result[key] = translated !== undefined ? translated : ''
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      result[key] = ''
    } else if (translated !== undefined) {
      result[key] = translated
    }
  }

  for (const [key, translated] of Object.entries(translationObject)) {
    if (key in newSource || key in oldObject) continue
    result[key] = translated
  }

  return result
}

const newSourceEntries = await readdir(newSourceDir, { withFileTypes: true })

for (const entry of newSourceEntries) {
  if (!entry.isFile() || !entry.name.endsWith('.json')) continue

  const oldSource = await readJsonOrEmpty(path.join(oldSourceDir, entry.name))
  const newSource = await readJsonOrEmpty(path.join(newSourceDir, entry.name))
  const translationPath = path.join(translationDir, entry.name)
  const translation = await readJsonOrEmpty(translationPath)

  const result = scaffold(oldSource, newSource, translation)

  const serialized = `${JSON.stringify(result, null, 2)}\n`
  if (serialized !== `${JSON.stringify(translation, null, 2)}\n`) {
    await writeFile(translationPath, serialized)
  }
}
