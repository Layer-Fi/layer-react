import {
  type PluginContext,
  getCallArgumentExpression,
  getCallExpressionName,
  resolveNamespacedKeyInfo,
  getStringValueFromExpression,
} from './extractPluginUtils'

const translationKeyPlugin = {
  name: 'translation-key-plugin',
  onVisitNode: (node: unknown, context: PluginContext) => {
    if (getCallExpressionName(node) !== 'translationKey') {
      return
    }

    const keyNode = getCallArgumentExpression(node, 0)
    const defaultValueNode = getCallArgumentExpression(node, 1)
    const nsNode = getCallArgumentExpression(node, 2)
    const key = getStringValueFromExpression(keyNode)
    const defaultValue = getStringValueFromExpression(defaultValueNode)
    const ns = getStringValueFromExpression(nsNode)

    if (key !== undefined && defaultValue !== undefined) {
      const namespacedKeyInfo = resolveNamespacedKeyInfo({ key, ns })

      context.addKey({
        ...namespacedKeyInfo,
        defaultValue,
        explicitDefault: true,
      })
    }
  },
}

export default translationKeyPlugin
