import { type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'

/** Every class name the combo box puts in the DOM. */
export const COMBO_BOX_CLASS_NAMES = {
  CONTAINER: 'Layer__ComboBoxContainer',

  CONTROL: 'Layer__ComboBoxControl',
  VALUE_CONTAINER: 'Layer__ComboBoxValueContainer',
  PLACEHOLDER: 'Layer__ComboBoxPlaceholder',

  INDICATORS_CONTAINER: 'Layer__ComboBoxIndicatorsContainer',

  MENU: 'Layer__ComboBoxMenu',
  MENU_LIST: 'Layer__ComboBoxMenuList',
  MENU_PORTAL: 'Layer__ComboBoxMenuPortal',

  GROUP: 'Layer__ComboBoxGroup',
  GROUP_HEADING: 'Layer__ComboBoxGroupHeading',

  OPTION: 'Layer__ComboBoxOption',
  OPTION_CHECK_ICON: 'Layer__ComboBoxOptionCheckIcon',

  NO_OPTIONS_MESSAGE: 'Layer__ComboBoxNoOptionsMessage',

  CLEAR_INDICATOR: 'Layer__ComboBoxClearIndicator',
  LOADING_INDICATOR: 'Layer__ComboBoxLoadingIndicator',
  DROPDOWN_INDICATOR: 'Layer__ComboBoxDropdownIndicator',

  SINGLE_VALUE: 'Layer__ComboBoxSingleValue',
  MULTI_VALUE: 'Layer__ComboBoxMultiValue',
  MULTI_VALUE_LABEL: 'Layer__ComboBoxMultiValueLabel',
  MULTI_VALUE_REMOVE: 'Layer__ComboBoxMultiValueRemove',
} as const

type ComboBoxClassName = (typeof COMBO_BOX_CLASS_NAMES)[keyof typeof COMBO_BOX_CLASS_NAMES]

/** Legacy maps key off the names above, so a key naming an element gone from it fails typecheck. */
export type ComboBoxLegacyClassNames = LegacyClassNameMapFor<ComboBoxClassName>
