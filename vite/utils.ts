import pkg from '../package.json'

export const OUT_DIR = 'dist'

export function buildExternalDeps(): (string | RegExp)[] {
  const deps = [
    ...Object.keys(pkg.peerDependencies ?? {}),
    ...Object.keys(pkg.dependencies ?? {}),
  ]
  return deps.map((dep) => {
    const escaped = dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`^${escaped}($|/)`)
  })
}
