import path from 'node:path'
import { Project, SyntaxKind } from 'ts-morph'

export type PublicExport = {
  /** The subpath a consumer writes: `@layerfi/components/<name>`. */
  name: string
  /** Source module path relative to `src/`, without extension. Mirrors the built layout. */
  module: string
  /** Every public value name the source module contributes. */
  values: string[]
  /** Every public type-only name the source module contributes. */
  types: string[]
}

const ENTRY = 'src/index.tsx'

/**
 * Reads the public surface out of `src/index.tsx` rather than repeating it in a second list, so a
 * new export cannot ship without a subpath. `src/index.test.ts` pins that surface, so a rename
 * fails there first.
 */
export function readPublicExports(root = process.cwd()): PublicExport[] {
  const project = new Project({ skipAddingFilesFromTsConfig: true })
  const entry = project.addSourceFileAtPath(path.join(root, ENTRY))

  const byModule = new Map<string, { values: string[], types: string[] }>()

  for (const declaration of entry.getExportDeclarations()) {
    const specifier = declaration.getModuleSpecifierValue()
    if (!specifier?.startsWith('.')) continue

    // `./components/x/Y` -> `components/x/Y`, matching `preserveModulesRoot: 'src'`.
    const module = path.normalize(path.join(path.dirname(ENTRY), specifier))
      .replace(/^src[\\/]/, '')
      .split(path.sep)
      .join('/')

    const entryForModule = byModule.get(module) ?? { values: [], types: [] }

    // `export { type A, B }` and `export type { A }` both mark A as type-only.
    const declarationIsTypeOnly = declaration.isTypeOnly()
    for (const named of declaration.getNamedExports()) {
      const name = (named.getAliasNode() ?? named.getNameNode()).getText()
      const isTypeOnly = declarationIsTypeOnly
        || named.getFirstChildByKind(SyntaxKind.TypeKeyword) !== undefined
      ;(isTypeOnly ? entryForModule.types : entryForModule.values).push(name)
    }

    byModule.set(module, entryForModule)
  }

  // One subpath per public name. Siblings from the same module share content, so
  // `@layerfi/components/LayerProvider` also carries `EventCallbacks`.
  return [...byModule].flatMap(([module, { values, types }]) =>
    [...values, ...types].map(name => ({ name, module, values, types })),
  ).sort((a, b) => a.name.localeCompare(b.name))
}
