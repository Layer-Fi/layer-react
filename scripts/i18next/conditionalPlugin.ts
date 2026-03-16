import {
  type PluginContext,
  getCallArgumentExpression,
  getCallExpressionName,
  getKeyName,
  getObjectProperties,
  getObjectPropertyValue,
  resolveNamespacedKeyInfo,
  getStringValue,
} from './extractPluginUtils'

const conditionalPlugin = {
  name: 'conditional-plugin',
  onVisitNode: (node: unknown, context: PluginContext) => {
    const calleeName = getCallExpressionName(node)
    const isTConditional = calleeName === 'tConditional'

    if (!isTConditional) return

    const key = getStringValue(getCallArgumentExpression(node, 1))
    if (!key) {
      return
    }

    const optionsExpression = getCallArgumentExpression(node, 2)
    const casesExpression = getObjectPropertyValue(optionsExpression, 'cases')
    const contextsExpression = getObjectPropertyValue(optionsExpression, 'contexts')
    const ns = getStringValue(getObjectPropertyValue(optionsExpression, 'ns'))
    const namespacedKeyInfo = resolveNamespacedKeyInfo({ key, ns })
    const extractedKeys = new Set<string>()

    for (const caseProperty of getObjectProperties(casesExpression)) {
      if (!caseProperty || typeof caseProperty !== 'object' || (caseProperty as { type?: string }).type !== 'KeyValueProperty') {
        continue
      }

      const caseName = getKeyName((caseProperty as { key?: unknown }).key)
      const defaultValue = getStringValue((caseProperty as { value?: unknown }).value)
      if (!caseName || !defaultValue) {
        continue
      }

      const contextValue = getStringValue(getObjectPropertyValue(contextsExpression, caseName))
      const extractedKey = contextValue ? `${namespacedKeyInfo.key}_${contextValue}` : namespacedKeyInfo.key

      if (extractedKeys.has(extractedKey)) {
        continue
      }

      extractedKeys.add(extractedKey)
      context.addKey({
        key: extractedKey,
        defaultValue,
        ns: namespacedKeyInfo.ns,
        explicitDefault: true,
      })
    }
  },
}

export default conditionalPlugin
