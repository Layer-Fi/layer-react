/* eslint-disable no-console */
import path from 'node:path'
import { Node, Project, SyntaxKind } from 'ts-morph'

/** Fails on a legacy map entry no call site reaches — it emits nothing while looking restored. */

function main() {
  const project = new Project({ skipFileDependencyResolution: true })
  project.addSourceFilesAtPaths(['src/**/*.ts', 'src/**/*.tsx'])

  const literalArguments = new Set<string>()
  const templatePrefixes = new Set<string>()

  for (const sourceFile of project.getSourceFiles()) {
    for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      if (!call.getExpression().getText().endsWith('legacyClassNames')) continue

      for (const argument of call.getDescendants()) {
        if (Node.isStringLiteral(argument)) {
          literalArguments.add(argument.getLiteralValue())
        }
        else if (Node.isTemplateExpression(argument)) {
          templatePrefixes.add(argument.getHead().getLiteralText())
        }
      }
    }
  }

  const unused: { file: string, key: string }[] = []

  for (const sourceFile of project.getSourceFiles()) {
    const file = path.relative(process.cwd(), sourceFile.getFilePath())

    for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      if (call.getExpression().getText() !== 'createLegacyClassNames') continue

      const [map] = call.getArguments()
      if (!map || !Node.isObjectLiteralExpression(map)) continue

      for (const property of map.getProperties()) {
        if (!Node.isPropertyAssignment(property)) continue

        const key = property.getName().replace(/^['"]|['"]$/g, '')
        const isReached = literalArguments.has(key)
          || [...templatePrefixes].some(prefix => prefix.length > 0 && key.startsWith(prefix))

        if (!isReached) unused.push({ file, key })
      }
    }
  }

  if (unused.length > 0) {
    console.error('\nMap entries no call site reaches — they emit nothing:')
    for (const entry of unused) console.error(`  ${entry.file}  ${entry.key}`)
    console.error(`\n${unused.length} unused`)
    process.exit(1)
  }

  console.log('Every legacy class name map entry is reached by a call site.')
}

main()
