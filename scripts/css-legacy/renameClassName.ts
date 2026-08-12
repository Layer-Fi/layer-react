/* eslint-disable no-console */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Renames a class name across source and styles, and seeds the map that keeps the old name in the
 * DOM.
 *
 *     npx tsx scripts/css-legacy/renameClassName.ts Layer__badge Layer__Badge [--dry]
 *
 * The rename is the easy half. Shipping it without the old name is what broke consumers between
 * v0.1.122 and today, so every rename adds the old name to a `createLegacyClassNames` map beside
 * the element that carries it.
 *
 * The map alone emits nothing: each renamed element still has to pass the new name through the
 * composer, `className={legacyClassNames('Layer__Badge')}`. That edit is left to a human because
 * it depends on how the element builds its class names. The files needing it are listed on exit,
 * and `npm run css:check-legacy-keys` fails until every seeded entry is reached.
 */

const UTIL_IMPORT = "import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'"

const [oldName, newName] = process.argv.slice(2).filter(argument => !argument.startsWith('--'))
const isDryRun = process.argv.includes('--dry')

if (!oldName || !newName) {
  console.error('usage: tsx scripts/css-legacy/renameClassName.ts <old> <new> [--dry]')
  process.exit(1)
}

function filesContaining(name: string) {
  try {
    return execFileSync('git', ['grep', '-l', '--untracked', '--fixed-strings', name, '--', 'src'], {
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean)
  }
  catch {
    return []
  }
}

/** Word-boundary aware: `Layer__badge` must not match inside `Layer__badge-icon`. */
function renameIn(source: string) {
  const escaped = oldName.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')
  return source.replace(new RegExp(`${escaped}(?![A-Za-z0-9_-])`, 'g'), newName)
}

function addLegacyEntry(source: string) {
  const entry = `  '${newName}': '${oldName}',\n`

  if (source.includes(`'${oldName}'`) && source.includes('createLegacyClassNames({')) return source

  if (source.includes('createLegacyClassNames({')) {
    return source.replace('createLegacyClassNames({\n', `createLegacyClassNames({\n${entry}`)
  }

  const lines = source.split('\n')
  const last = lines.reduce((best, line, index) => line.startsWith('import ') ? index : best, -1)
  const block = `const legacyClassNames = createLegacyClassNames({\n${entry}})`
  lines.splice(last + 1, 0, ...(source.includes(UTIL_IMPORT) ? [] : [UTIL_IMPORT]), '', block)
  return lines.join('\n')
}

const touched = filesContaining(oldName)
const styles = touched.filter(file => file.endsWith('.scss'))
const sources = touched.filter(file => /\.tsx?$/.test(file))

if (touched.length === 0) {
  console.error(`${oldName} appears nowhere under src/`)
  process.exit(1)
}

console.log(`${oldName} → ${newName}${isDryRun ? '  (dry run)' : ''}\n`)

const needsCallSiteEdit: string[] = []

for (const file of touched) {
  const source = fs.readFileSync(file, 'utf8')
  let updated = renameIn(source)

  // Only the modules that render the class need to keep emitting the old one.
  const rendersIt = /\.tsx?$/.test(file) && /className|classNames|CLASS_NAME/.test(source)
  if (rendersIt) {
    updated = addLegacyEntry(updated)
    needsCallSiteEdit.push(file)
  }

  if (updated === source) continue
  if (!isDryRun) fs.writeFileSync(file, updated)
  console.log(`  ${rendersIt ? 'renamed + mapped' : 'renamed'}  ${file}`)
}

console.log(`\n${sources.length} source files, ${styles.length} stylesheets`)

if (needsCallSiteEdit.length > 0) {
  console.log(`\nStill emitting only ${newName} — pass it through the composer in each of these:`)
  for (const file of needsCallSiteEdit) console.log(`  ${file}`)
  console.log(`\n    className={legacyClassNames('${newName}')}`)
}

console.log(isDryRun
  ? '\nDry run — nothing written.'
  : '\nNext: npm run lint -- --fix && npm run css:check-legacy-keys')
