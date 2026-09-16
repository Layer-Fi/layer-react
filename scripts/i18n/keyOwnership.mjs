/** Which namespace and owner a source file's keys must carry. See src/assets/locales/SKILL.md. */
import fs from 'node:fs'
import path from 'node:path'

export const SOURCE_ROOT = 'src'

/** Cross-cutting namespaces: category-scoped, no owner segment, reusable from any file. */
export const SHARED_NAMESPACES = ['common', 'date', 'upload', 'usStates']

/** Directories under `src/` whose second segment is a feature domain. */
const DOMAIN_PARENTS = ['components', 'hooks', 'providers', 'schemas', 'types', 'utils']

/** `src/hooks/legacy` predates the domain layout, so its namespaces are left alone. */
const GRANDFATHERED_DIR = /^src\/hooks\/legacy\//

const toPosixPath = file => file.split(path.sep).join('/')

/**
 * A directory's namesake is the component; anything else is a sub-part qualified by its parent
 * (`Tasks/TasksPanelNotification.tsx` → `Tasks.TasksPanelNotification`), which keeps generic names
 * like `formUtils.ts` distinct between components.
 */
const ownerOfFile = (file, domainDirectory) => {
  const directoryName = path.basename(path.dirname(file))
  const fileName = path.basename(file).replace(/\.[jt]sx?$/, '')

  // Non-component tiers put modules straight in the domain folder; those own their keys alone.
  if (directoryName === domainDirectory) return fileName

  return fileName === directoryName ? directoryName : `${directoryName}.${fileName}`
}

export const ownershipFor = (rawFile) => {
  const file = toPosixPath(rawFile)

  if (GRANDFATHERED_DIR.test(file)) {
    return { grandfathered: true, owner: ownerOfFile(file, 'legacy') }
  }

  const domainMatch = file.match(/^src\/([^/]+)\/features\/([^/]+)\//)
  if (domainMatch && DOMAIN_PARENTS.includes(domainMatch[1])) {
    const domain = domainMatch[2]
    return { namespace: domain, owner: ownerOfFile(file, domain), allowsAnyDomain: false }
  }

  const tierMatch = file.match(/^src\/components\/(blocks|ui)\//)
  if (tierMatch) {
    const tier = tierMatch[1]
    return { namespace: tier, owner: ownerOfFile(file, tier), allowsAnyDomain: false }
  }

  if (/^src\/views\//.test(file)) {
    return { namespace: 'views', owner: ownerOfFile(file, 'views'), allowsAnyDomain: true }
  }

  return undefined
}

export const listSourceFiles = (root = SOURCE_ROOT) => {
  const files = []
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(entryPath)
      else if (/\.[jt]sx?$/.test(entry.name)) files.push(toPosixPath(entryPath))
    }
  }
  walk(root)
  return files
}
