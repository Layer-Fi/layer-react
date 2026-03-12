import {
  type PluginContext,
  getCallArgumentExpression,
  getCallExpressionName,
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
    const key = getStringValueFromExpression(keyNode)
    const defaultValue = getStringValueFromExpression(defaultValueNode)

    if (key !== undefined && defaultValue !== undefined) {
      context.addKey({
        key,
        defaultValue,
        explicitDefault: true,
      })
    }
  },
}

export default translationKeyPlugin
