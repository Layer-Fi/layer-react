import { useId, useMemo } from 'react'
import classNames from 'classnames'
import type { CSSObjectWithLabel, GroupBase, Props as SelectProps, StylesConfig } from 'react-select'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { COMBO_BOX_CLASS_NAMES, type ComboBoxLegacyClassNames } from '@ui/ComboBox/classnames'
import type { AriaLabelProps, BaseComboBoxProps, ComboBoxOption } from '@ui/ComboBox/types'
import { useComboBoxSubcomponents } from '@ui/ComboBox/useComboBoxSubcomponents'
import { PORTAL_CLASS_NAME } from '@ui/Portal/Portal'

const legacyClassNames = createLegacyClassNames({
  'Layer__ComboBoxContainer': 'Layer__select',
  'Layer__ComboBoxControl': 'Layer__select__control',
  'Layer__ComboBoxControl--Focused': ['Layer__select__control--is-focused', 'Layer__ComboBoxControl--focused'],
  'Layer__ComboBoxControl--Error': ['Layer__select--error', 'Layer__ComboBoxControl--error'],
  'Layer__ComboBoxValueContainer': 'Layer__select__value-container',
  'Layer__ComboBoxPlaceholder': 'Layer__select__placeholder',
  'Layer__ComboBoxMenu': 'Layer__select__menu',
  'Layer__ComboBoxMenuPortal': 'Layer__select__menu-portal',
  'Layer__ComboBoxMultiValueRemove': 'Layer__select__multi-value__remove',
  'Layer__ComboBoxControl--Disabled': ['Layer__select__control--is-disabled', 'Layer__ComboBoxControl--disabled'],
} satisfies ComboBoxLegacyClassNames)

/** The readonly names never had a v0.1.122 counterpart; the map exists to keep their old spelling. */
const readonlyClassNames = createLegacyClassNames({
  'Layer__ComboBoxControl--Readonly': 'Layer__ComboBoxControl--readonly',
  'Layer__ComboBoxIndicatorsContainer--Readonly': 'Layer__ComboBoxIndicatorsContainer--readonly',
} satisfies ComboBoxLegacyClassNames)

type UseCommonComboBoxPropsReturn<T extends ComboBoxOption, IsMulti extends boolean> =
  Partial<SelectProps<T, IsMulti, GroupBase<T>>> & AriaLabelProps

export function useCommonComboBoxProps<T extends ComboBoxOption, IsMulti extends boolean>({
  className,
  name,
  options,
  groups,
  onInputValueChange,
  inputId,
  placeholder,
  slots,
  displayDisabledAsSelected,
  isDisabled,
  isError,
  isInvalid,
  isReadOnly = false,
  isClearable = true,
  isSearchable = true,
  isLoading,
  isMutating,
  menuIsOpen,
  menuPortalTarget = document.body,
  filterOption,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
}: Pick<
  BaseComboBoxProps<T>,
  | 'className'
  | 'name'
  | 'options'
  | 'groups'
  | 'onInputValueChange'
  | 'inputId'
  | 'placeholder'
  | 'slots'
  | 'displayDisabledAsSelected'
  | 'isDisabled'
  | 'isError'
  | 'isInvalid'
  | 'isReadOnly'
  | 'isClearable'
  | 'isSearchable'
  | 'isLoading'
  | 'isMutating'
  | 'menuIsOpen'
  | 'menuPortalTarget'
  | 'filterOption'
> & AriaLabelProps): UseCommonComboBoxPropsReturn<T, IsMulti> {
  const internalInputId = useId()
  const effectiveInputId = inputId ?? internalInputId

  const components = useComboBoxSubcomponents<T, IsMulti>({
    placeholder,
    slots,
    displayDisabledAsSelected,
  })

  const hasError = isError || isInvalid
  const selectClassNames = useMemo(() => ({
    container: () => legacyClassNames('Layer__ComboBoxContainer'),
    control: ({ isFocused, isDisabled }: { isFocused: boolean, isDisabled: boolean }) => classNames(
      legacyClassNames(
        'Layer__ComboBoxControl',
        isFocused && 'Layer__ComboBoxControl--Focused',
        isDisabled && 'Layer__ComboBoxControl--Disabled',
        hasError && 'Layer__ComboBoxControl--Error',
      ),
      isReadOnly && readonlyClassNames('Layer__ComboBoxControl--Readonly'),
    ),
    valueContainer: () => legacyClassNames('Layer__ComboBoxValueContainer'),
    placeholder: () => legacyClassNames('Layer__ComboBoxPlaceholder'),
    indicatorsContainer: () => classNames(
      COMBO_BOX_CLASS_NAMES.INDICATORS_CONTAINER,
      isReadOnly && readonlyClassNames('Layer__ComboBoxIndicatorsContainer--Readonly'),
    ),
    menu: () => classNames(PORTAL_CLASS_NAME, legacyClassNames('Layer__ComboBoxMenu')),
    menuPortal: () => legacyClassNames('Layer__ComboBoxMenuPortal'),
    multiValueRemove: () => legacyClassNames('Layer__ComboBoxMultiValueRemove'),
    menuList: () => COMBO_BOX_CLASS_NAMES.MENU_LIST,
    group: () => COMBO_BOX_CLASS_NAMES.GROUP,
  }), [hasError, isReadOnly])

  const styles: StylesConfig<T, IsMulti, GroupBase<T>> = useMemo(() => ({
    menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 101 }),
  }), [])

  const selectProps = useMemo(() => ({
    inputId: effectiveInputId,
    className,
    name,
    options: options ?? groups,
    onInputChange: onInputValueChange,
    placeholder,
    unstyled: true,
    escapeClearsValue: true,
    menuPortalTarget,
    classNames: selectClassNames,
    styles,
    components,
    isClearable: isClearable && !isReadOnly,
    isDisabled,
    isSearchable: isSearchable && !isReadOnly,
    isLoading: isLoading || isMutating,
    openMenuOnClick: !isReadOnly,
    menuIsOpen,
    menuPlacement: 'auto' as const,
    menuShouldScrollIntoView: false,
    filterOption,
    ['aria-label']: ariaLabel,
    ['aria-labelledby']: ariaLabelledby,
    ['aria-describedby']: ariaDescribedby,
  }), [
    ariaDescribedby,
    ariaLabel,
    ariaLabelledby,
    className,
    components,
    effectiveInputId,
    filterOption,
    groups,
    isClearable,
    isDisabled,
    isLoading,
    isMutating,
    isReadOnly,
    isSearchable,
    menuIsOpen,
    menuPortalTarget,
    name,
    onInputValueChange,
    options,
    placeholder,
    selectClassNames,
    styles,
  ])

  return selectProps
}
