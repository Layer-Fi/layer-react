import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const [baseDir, targetDir] = process.argv.slice(2)

if (!baseDir || !targetDir) {
  console.error('Usage: node scripts/i18next/mergeExistingTranslations.mjs <base-locale-dir> <target-locale-dir>')
  process.exit(1)
}

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))

// Downloaded values win; base values survive only where the download has none.
const applyDownloaded = (baseValue, targetValue) => {
  if (targetValue === undefined) return baseValue
  if (baseValue === undefined) return targetValue

  if (Array.isArray(baseValue)) {
    if (!Array.isArray(targetValue)) return baseValue

    const length = Math.max(baseValue.length, targetValue.length)
    return Array.from({ length }, (_, index) => applyDownloaded(baseValue[index], targetValue[index]))
  }

  if (baseValue && typeof baseValue === 'object') {
    const targetObject = targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)
      ? targetValue
      : {}

    const newKeys = Object.keys(targetObject).filter(key => !(key in baseValue))
    return Object.fromEntries(
      [...Object.keys(baseValue), ...newKeys].map(key => [
        key,
        applyDownloaded(baseValue[key], targetObject[key]),
      ]),
    )
  }

  return targetValue === '' ? baseValue : targetValue
}

const processDir = async (basePath, targetPath) => {
  const targetEntries = await readdir(targetPath, { withFileTypes: true })

  for (const targetEntry of targetEntries) {
    const targetEntryPath = path.join(targetPath, targetEntry.name)
    const baseEntryPath = path.join(basePath, targetEntry.name)

    if (targetEntry.isDirectory()) {
      await processDir(baseEntryPath, targetEntryPath)
      continue
    }

    if (!targetEntry.isFile() || !targetEntry.name.endsWith('.json')) {
      continue
    }

    let baseJson
    try {
      baseJson = await readJson(baseEntryPath)
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        // No local counterpart: an obsolete namespace still on Crowdin.
        await rm(targetEntryPath)
        continue
      }

      throw error
    }

    const targetJson = await readJson(targetEntryPath)
    const mergedJson = applyDownloaded(baseJson, targetJson)

    await writeFile(targetEntryPath, `${JSON.stringify(mergedJson, null, 2)}\n`)
  }
}

await processDir(baseDir, targetDir)
