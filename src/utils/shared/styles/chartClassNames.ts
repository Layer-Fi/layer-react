import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'

/** Rendered by every chart wrapper, so the composer lives here rather than beside one of them. */
const legacyClassNames = createLegacyClassNames({
  'Layer__UI__Chart--FocusReset': 'Layer__UI__Chart--focusReset',
})

export const CHART_FOCUS_RESET_CLASS_NAME = legacyClassNames('Layer__UI__Chart--FocusReset')
