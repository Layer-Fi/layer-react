import fs from 'node:fs'
import path from 'node:path'

export const SRC = 'src'
export const LOCALES_DIR = path.join(SRC, 'assets/locales')
export const SOURCE_LOCALE = 'en-US'
export const LOCALES = ['en-US', 'fr-CA']

/**
 * Cross-cutting namespaces: category-scoped, no owner segment, reused on purpose.
 * Any zone may read from these.
 */
export const SHARED_NAMESPACES = ['common', 'date', 'upload', 'usStates']

/** Namespaces that carry an `<Owner>` segment between the namespace and the category. */
export const TIER_NAMESPACES = ['blocks', 'views', 'ui']

/** Retired namespaces are resolved from the call site's zone, never from the old namespace. */
export const RETIRED_NAMESPACES = [
  'callBookings',
  'categorizationRules',
  'chartOfAccounts',
  'landingPage',
  'mileageTracking',
  'overview',
  'stripe',
  'trips',
  'vehicles',
]

/** Directories under `src/` whose second segment is a feature domain. */
const DOMAIN_PARTITION_ROOTS = ['components', 'hooks', 'providers', 'schemas', 'types', 'utils']

const TEST_FILE = /\.(test|spec)\.[jt]sx?$|\.stories\.[jt]sx?$|\.storyData\.[jt]sx?$/

/** `src/hooks/legacy` predates the domain layout; its namespaces are grandfathered. */
const GRANDFATHERED = /^src\/hooks\/legacy\//

export const isExempt = (file) => TEST_FILE.test(file)

const toPosix = (file) => file.split(path.sep).join('/')

/**
 * The unit that owns a key: the containing directory, except when that directory is the domain
 * itself (non-component tiers put modules directly in the domain folder), where it's the basename.
 */
const ownerFor = (file, domainDir) => {
  const dir = path.dirname(file)
  const containing = path.basename(dir)
  if (containing === domainDir) {
    return path.basename(file).replace(/\.[jt]sx?$/, '')
  }
  return containing
}

/**
 * Resolves which namespace a file owns and which owner segment its keys must carry.
 * Returns `undefined` for files outside every zone.
 */
export const zoneFor = (rawFile) => {
  const file = toPosix(rawFile)

  if (GRANDFATHERED.test(file)) {
    return { grandfathered: true, owner: ownerFor(file, 'legacy') }
  }

  const features = file.match(/^src\/([^/]+)\/features\/([^/]+)\//)
  if (features && DOMAIN_PARTITION_ROOTS.includes(features[1])) {
    const domain = features[2]
    return { namespace: domain, owner: ownerFor(file, domain), allowsAnyDomain: false }
  }

  const tier = file.match(/^src\/components\/(blocks|ui)\//)
  if (tier) {
    return { namespace: tier[1], owner: ownerFor(file, tier[1]), allowsAnyDomain: false }
  }

  const view = file.match(/^src\/views\/([^/]+)\//)
  if (view) {
    return { namespace: 'views', owner: view[1], allowsAnyDomain: true }
  }

  const flatView = file.match(/^src\/views\/[^/]+\.[jt]sx?$/)
  if (flatView) {
    return { namespace: 'views', owner: path.basename(file).replace(/\.[jt]sx?$/, ''), allowsAnyDomain: true }
  }

  return undefined
}

export const listSourceFiles = (root = SRC) => {
  const files = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.[jt]sx?$/.test(entry.name)) files.push(toPosix(full))
    }
  }
  walk(root)
  return files
}

const flatten = (node, prefix, out) => {
  for (const [segment, value] of Object.entries(node)) {
    const key = prefix ? `${prefix}.${segment}` : segment
    if (value && typeof value === 'object') flatten(value, key, out)
    else out[key] = value
  }
  return out
}

/** Every leaf of a locale tree as `namespace:dotted.key`. */
export const readLocale = (locale) => {
  const dir = path.join(LOCALES_DIR, locale)
  const out = {}
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.json')) continue
    const namespace = file.replace(/\.json$/, '')
    const tree = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
    for (const [key, value] of Object.entries(flatten(tree, '', {}))) {
      out[`${namespace}:${key}`] = value
    }
  }
  return out
}
