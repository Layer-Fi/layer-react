import pkg from '../package.json'

export const OUT_DIR = 'dist'

type Mode = 'esm' | 'cjs'

export function buildExternalDeps(opts?: {
  mode?: Mode
  bundleForCjs?: string[]
}): RegExp[] {
  const mode = opts?.mode ?? 'esm'
  const bundleForCjs = new Set(opts?.bundleForCjs ?? [])

  const deps = [
    ...Object.keys(pkg.peerDependencies ?? {}),
    ...Object.keys(pkg.dependencies ?? {}),
  ]

  const externals = deps.map((dep) => {
    const escaped = dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`^${escaped}($|/)`)
  })

  if (mode !== 'cjs' || bundleForCjs.size === 0) return externals

  const matchesAnyBundled = (re: RegExp) =>
     Array.from(bundleForCjs).some((name) => re.test(name))

  return externals.filter((re) => !matchesAnyBundled(re))
}