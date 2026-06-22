import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const [baseDir, targetDir] = process.argv.slice(2)

if (!baseDir || !targetDir) {
  console.error('Usage: node scripts/i18next/mergeExistingTranslations.mjs <base-locale-dir> <target-locale-dir>')
  process.exit(1)
}

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))

const mergeExisting = (baseValue, targetValue) => {
  if (Array.isArray(baseValue)) {
    if (!Array.isArray(targetValue)) return baseValue

    return baseValue.map((item, index) => mergeExisting(item, targetValue[index]))
  }

  if (baseValue && typeof baseValue === 'object') {
    const targetObject = targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)
      ? targetValue
      : {}

    return Object.fromEntries(
      Object.entries(baseValue).map(([key, value]) => [
        key,
        mergeExisting(value, targetObject[key]),
      ]),
    )
  }

  return targetValue === undefined || targetValue === '' ? baseValue : targetValue
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

    try {
      const baseJson = await readJson(baseEntryPath)
      const targetJson = await readJson(targetEntryPath)
      const mergedJson = mergeExisting(baseJson, targetJson)

      await writeFile(targetEntryPath, `${JSON.stringify(mergedJson, null, 2)}\n`)
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        await rm(targetEntryPath)
        continue
      }

      throw error
    }
  }
}

await processDir(baseDir, targetDir)
