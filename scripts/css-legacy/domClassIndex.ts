import path from 'node:path'
import { Node, Project, SyntaxKind, type SourceFile, VariableDeclarationKind } from 'ts-morph'

/** Every class name the tree can put in the DOM, resolved through templates and prefixes. */

export type DomClassSite = {
  file: string
  line: number
  element: string
  siblings: string[]
  ancestors: string[]
  pattern?: string
  generatedByPrefix?: string
  isWeak?: boolean
}

export type DomClassIndex = {
  exact: Map<string, DomClassSite[]>
  patterns: { regexp: RegExp, site: DomClassSite }[]
  prefixes: { prefix: string, site: DomClassSite }[]
}

const UNRESOLVED = '\u0000'

const MINIMUM_PATTERN_LITERAL = 'Layer__'.length + 4

const CLASS_NAME_PREFIX_ATTRIBUTE = 'classNamePrefix'

let constantMembers = new Map<string, string>()

function collectConstantMembers(sourceFile: SourceFile) {
  for (const declaration of sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration)) {
    if (declaration.getVariableStatement()?.getDeclarationKind() !== VariableDeclarationKind.Const) continue

    const initializer = declaration.getInitializer()
    if (!initializer || !Node.isObjectLiteralExpression(initializer)) continue

    for (const property of initializer.getProperties()) {
      if (!Node.isPropertyAssignment(property)) continue

      const value = property.getInitializer()
      if (!value || !Node.isStringLiteral(value)) continue

      constantMembers.set(`${declaration.getName()}.${property.getName()}`, value.getLiteralValue())
    }
  }
}

function resolveTemplate(node: Node): string | undefined {
  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
    return node.getLiteralValue()
  }

  if (Node.isIdentifier(node)) {
    const declaration = node.getSymbol()?.getDeclarations()?.[0]

    if (declaration && Node.isVariableDeclaration(declaration)
      && declaration.getVariableStatement()?.getDeclarationKind() === VariableDeclarationKind.Const) {
      const initializer = declaration.getInitializer()
      if (initializer && initializer !== node) return resolveTemplate(initializer)
    }

    return UNRESOLVED
  }

  if (Node.isTemplateExpression(node)) {
    let text = node.getHead().getLiteralText()
    for (const span of node.getTemplateSpans()) {
      text += resolveTemplate(span.getExpression()) ?? UNRESOLVED
      text += span.getLiteral().getLiteralText()
    }
    return text
  }

  if (Node.isPropertyAccessExpression(node)) {
    return constantMembers.get(node.getText()) ?? UNRESOLVED
  }

  if (Node.isElementAccessExpression(node)) {
    return UNRESOLVED
  }

  return undefined
}

const CLASS_NAME_COMPOSERS = /(^|\.)(classNames|clsx|cn)$/

function isInsideClassNameProp(node: Node) {
  const attribute = node.getFirstAncestorByKind(SyntaxKind.JsxAttribute)
  if (attribute?.getNameNode().getText().endsWith('lassName')) return true

  const call = node.getFirstAncestorByKind(SyntaxKind.CallExpression)
  return call ? CLASS_NAME_COMPOSERS.test(call.getExpression().getText()) : false
}

function describeSite(node: Node, file: string) {
  const owner = node.getFirstAncestor(
    ancestor => Node.isJsxOpeningElement(ancestor) || Node.isJsxSelfClosingElement(ancestor),
  )

  const element = owner && (Node.isJsxOpeningElement(owner) || Node.isJsxSelfClosingElement(owner))
    ? owner.getTagNameNode().getText()
    : '(not in JSX)'

  const ancestors = node
    .getAncestors()
    .filter(Node.isJsxElement)
    .map(ancestor => ancestor.getOpeningElement().getTagNameNode().getText())
    .slice(0, 3)
    .reverse()

  return { file, line: node.getStartLineNumber(), element, ancestors }
}

function collectPrefixes(sourceFile: SourceFile, file: string, index: DomClassIndex) {
  for (const attribute of sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute)) {
    if (attribute.getNameNode().getText() !== CLASS_NAME_PREFIX_ATTRIBUTE) continue

    const initializer = attribute.getInitializer()
    if (!initializer) continue

    const expression = Node.isJsxExpression(initializer)
      ? initializer.getExpression()
      : initializer
    const resolved = expression && resolveTemplate(expression)
    if (!resolved || resolved.includes(UNRESOLVED) || !resolved.includes('Layer')) continue

    index.prefixes.push({
      prefix: resolved,
      site: {
        ...describeSite(attribute, file),
        siblings: [],
        generatedByPrefix: resolved,
      },
    })
  }
}

function collectFromSourceFile(sourceFile: SourceFile, root: string, index: DomClassIndex) {
  const file = path.relative(root, sourceFile.getFilePath())
  collectPrefixes(sourceFile, file, index)

  const candidates: Node[] = [
    ...sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.TemplateExpression),
  ]

  for (const node of candidates) {
    if (node.getParent()?.getKind() === SyntaxKind.TemplateSpan) continue

    const resolved = resolveTemplate(node)
    if (!resolved) continue

    if (!resolved.includes('Layer__') && !isInsideClassNameProp(node)) continue

    const tokens = resolved.split(/\s+/).filter(Boolean)
    const site = describeSite(node, file)

    for (const token of tokens) {
      const siblings = tokens.filter(other => other !== token)

      if (token.includes(UNRESOLVED)) {
        const literalLength = token.split(UNRESOLVED).join('').length

        if (literalLength === 0) continue

        const isWeak = literalLength < MINIMUM_PATTERN_LITERAL

        const source = token
          .split(UNRESOLVED)
          .map(part => part.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'))
          .join('((?:[A-Za-z0-9-]|_(?!_))*)')
        index.patterns.push({
          regexp: new RegExp(`^${source}$`),
          site: { ...site, siblings, isWeak, pattern: token.replaceAll(UNRESOLVED, '*') },
        })
        continue
      }

      if (!index.exact.has(token)) index.exact.set(token, [])
      index.exact.get(token)!.push({ ...site, siblings })
    }
  }
}

export function buildDomClassIndex(root: string): DomClassIndex {
  const project = new Project({
    compilerOptions: { allowJs: true, jsx: 4 },
    skipFileDependencyResolution: true,
  })
  project.addSourceFilesAtPaths([`${root}/src/**/*.tsx`, `${root}/src/**/*.ts`])

  constantMembers = new Map()
  for (const sourceFile of project.getSourceFiles()) {
    collectConstantMembers(sourceFile)
  }

  const index: DomClassIndex = { exact: new Map(), patterns: [], prefixes: [] }
  for (const sourceFile of project.getSourceFiles()) {
    collectFromSourceFile(sourceFile, root, index)
  }

  return index
}

export function lookup(index: DomClassIndex, name: string) {
  const exact = index.exact.get(name)
  if (exact) return exact

  const matched = index.patterns
    .filter(({ site }) => !site.isWeak)
    .filter(({ regexp }) => regexp.test(name))
  if (matched.length > 0) return matched.map(({ site }) => site)

  const generated = index.prefixes.filter(({ prefix }) => name.startsWith(`${prefix}__`))
  return generated.map(({ site }) => site)
}
