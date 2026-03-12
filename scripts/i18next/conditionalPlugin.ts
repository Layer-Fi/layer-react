import {
  type PluginContext,
  getCallArgumentExpression,
  getCallExpressionName,
  getKeyName,
  getObjectProperties,
  getObjectPropertyValue,
  getStringValue,
} from './extractPluginUtils'

const conditionalPlugin = {
  name: 'conditional-plugin',
  onVisitNode: (node: unknown, context: PluginContext) => {
    const calleeName = getCallExpressionName(node)
    const isTConditional = calleeName === 'tConditional'
    const isI18nextConditional = calleeName === 'i18nextConditional'

    if (!isTConditional && !isI18nextConditional) {
      return
    }

    const key = getStringValue(getCallArgumentExpression(node, isTConditional ? 1 : 0))
    if (!key) {
      return
    }

    const optionsExpression = getCallArgumentExpression(node, isTConditional ? 2 : 1)
    const casesExpression = getObjectPropertyValue(optionsExpression, 'cases')
    const contextsExpression = getObjectPropertyValue(optionsExpression, 'contexts')
    const ns = getStringValue(getObjectPropertyValue(optionsExpression, 'ns'))
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
      const extractedKey = contextValue ? `${key}_${contextValue}` : key

      if (extractedKeys.has(extractedKey)) {
        continue
      }

      extractedKeys.add(extractedKey)
      context.addKey({
        key: extractedKey,
        defaultValue,
        ns,
        explicitDefault: true,
      })
    }
  },
}

export default conditionalPlugin
