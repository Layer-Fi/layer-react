export type KeyInfo = {
  key: string
  defaultValue: string
  ns?: string
  explicitDefault?: boolean
}

type NamespacedKeyInfo = {
  key: string
  ns?: string
}

export type PluginContext = {
  addKey: (keyInfo: KeyInfo) => void
}

export const getKeyName = (key: unknown): string | undefined => {
  if (!key || typeof key !== 'object' || !('type' in key)) {
    return
  }

  if ((key as { type: string }).type === 'Identifier') {
    const value = (key as { value?: unknown }).value
    if (typeof value === 'string') {
      return value
    }

    const name = (key as { name?: unknown }).name
    return typeof name === 'string' ? name : undefined
  }

  if ((key as { type: string }).type === 'StringLiteral') {
    const value = (key as { value?: unknown }).value
    return typeof value === 'string' ? value : undefined
  }
}

export const resolveNamespacedKeyInfo = ({
  key,
  ns,
  fallbackNs,
}: {
  key: string
  ns?: string
  fallbackNs?: string
}): NamespacedKeyInfo => {
  if (ns) return { key, ns }

  const separatorIndex = key.indexOf(':')
  const hasInlineNamespace = separatorIndex > 0 && separatorIndex < key.length - 1
  if (hasInlineNamespace) {
    return {
      ns: key.slice(0, separatorIndex),
      key: key.slice(separatorIndex + 1),
    }
  }

  return { key, ns: fallbackNs }
}

export const getObjectProperties = (expression: unknown): unknown[] => {
  if (!expression || typeof expression !== 'object' || (expression as { type?: string }).type !== 'ObjectExpression') {
    return []
  }

  return (expression as { properties?: unknown[] }).properties ?? []
}

export const getObjectPropertyValue = (expression: unknown, propertyName: string): unknown => {
  for (const property of getObjectProperties(expression)) {
    if (!property || typeof property !== 'object') {
      continue
    }

    if ((property as { type?: string }).type !== 'KeyValueProperty') {
      continue
    }

    const key = getKeyName((property as { key?: unknown }).key)
    if (key === propertyName) {
      return (property as { value?: unknown }).value
    }
  }
}

export const getStringValue = (expression: unknown): string | undefined => {
  if (!expression || typeof expression !== 'object') {
    return
  }

  if ((expression as { type?: string }).type === 'StringLiteral') {
    return (expression as { value?: string }).value
  }

  if ((expression as { type?: string }).type === 'TemplateLiteral') {
    const templateLiteral = expression as {
      expressions?: unknown[]
      quasis?: Array<{ cooked?: string }>
    }

    if ((templateLiteral.expressions ?? []).length === 0) {
      return templateLiteral.quasis?.[0]?.cooked
    }
  }
}

export const getStringValueFromExpression = (expression: unknown): string | undefined => {
  const direct = getStringValue(expression)
  if (direct !== undefined) return direct

  if (!expression || typeof expression !== 'object') return

  const type = (expression as { type?: string }).type
  if (type === 'TSAsExpression' || type === 'TSSatisfiesExpression') {
    const inner = (expression as { expression?: unknown }).expression
    return getStringValueFromExpression(inner)
  }

  return undefined
}

export const getCallExpressionName = (expression: unknown): string | undefined => {
  if (!expression || typeof expression !== 'object' || (expression as { type?: string }).type !== 'CallExpression') {
    return
  }

  const callee = (expression as { callee?: unknown }).callee
  if (!callee || typeof callee !== 'object' || (callee as { type?: string }).type !== 'Identifier') {
    return
  }

  const value = (callee as { value?: unknown }).value
  if (typeof value === 'string') {
    return value
  }

  const name = (callee as { name?: unknown }).name
  return typeof name === 'string' ? name : undefined
}

export const getCallArgumentExpression = (expression: unknown, index: number): unknown => {
  if (!expression || typeof expression !== 'object' || (expression as { type?: string }).type !== 'CallExpression') {
    return
  }

  const argument = (expression as { arguments?: Array<{ expression?: unknown }> }).arguments?.[index]
  return argument?.expression
}
