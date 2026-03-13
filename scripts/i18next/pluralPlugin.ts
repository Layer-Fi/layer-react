import {
  type PluginContext,
  getCallArgumentExpression,
  getCallExpressionName,
  getObjectPropertyValue,
  getStringValue,
} from './extractPluginUtils'

const pluralPlugin = {
  name: 'plural-plugin',
  onVisitNode: (node: unknown, context: PluginContext) => {
    const calleeName = getCallExpressionName(node)
    const isTPlural = calleeName === 'tPlural'

    if (!isTPlural) return

    const key = getStringValue(getCallArgumentExpression(node, 1))
    if (!key) {
      return
    }

    const optionsExpression = getCallArgumentExpression(node, 2)
    const ns = getStringValue(getObjectPropertyValue(optionsExpression, 'ns'))
    const one = getStringValue(getObjectPropertyValue(optionsExpression, 'one'))
    const other = getStringValue(getObjectPropertyValue(optionsExpression, 'other'))

    if (one) {
      context.addKey({
        key: `${key}_one`,
        defaultValue: one,
        ns,
        explicitDefault: true,
      })
    }

    if (other) {
      context.addKey({
        key: `${key}_other`,
        defaultValue: other,
        ns,
        explicitDefault: true,
      })
    }
  },
}

export default pluralPlugin
