import { useId, useMemo } from 'react'
import classNames from 'classnames'
import type { CSSObjectWithLabel, GroupBase, StylesConfig } from 'react-select'

import { COMBO_BOX_CLASS_NAMES } from '@ui/ComboBox/classnames'
import type { AriaLabelProps, BaseComboBoxProps, ComboBoxOption } from '@ui/ComboBox/types'
import { useComboBoxSubcomponents } from '@ui/ComboBox/useComboBoxSubcomponents'

export function useCommonComboBoxProps<T extends ComboBoxOption>({
  className,
  selectedValue,
  onSelectedValueChange,
  options,
  groups,
  onInputValueChange,
  inputId,
  placeholder,
  slots,
  displayDisabledAsSelected,
  isDisabled,
  isReadOnly = false,
  isClearable = true,
  isSearchable = true,
  isLoading,
  isMutating,
  menuPlacement,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
}: Pick<
  BaseComboBoxProps<T>,
  | 'className'
  | 'selectedValue'
  | 'onSelectedValueChange'
  | 'options'
  | 'groups'
  | 'onInputValueChange'
  | 'inputId'
  | 'placeholder'
  | 'slots'
  | 'displayDisabledAsSelected'
  | 'isDisabled'
  | 'isReadOnly'
  | 'isClearable'
  | 'isSearchable'
  | 'isLoading'
  | 'isMutating'
  | 'menuPlacement'
> & AriaLabelProps) {
  const internalInputId = useId()
  const effectiveInputId = inputId ?? internalInputId

  const components = useComboBoxSubcomponents<T>({
    placeholder,
    slots,
    displayDisabledAsSelected,
  })

  const selectClassNames = useMemo(() => ({
    container: () => COMBO_BOX_CLASS_NAMES.CONTAINER,
    control: ({ isFocused, isDisabled }: { isFocused: boolean, isDisabled: boolean }) => classNames(
      COMBO_BOX_CLASS_NAMES.CONTROL,
      isFocused && `${COMBO_BOX_CLASS_NAMES.CONTROL}--focused`,
      isDisabled && `${COMBO_BOX_CLASS_NAMES.CONTROL}--disabled`,
      isReadOnly && `${COMBO_BOX_CLASS_NAMES.CONTROL}--readonly`,
    ),
    valueContainer: () => COMBO_BOX_CLASS_NAMES.VALUE_CONTAINER,
    placeholder: () => COMBO_BOX_CLASS_NAMES.PLACEHOLDER,
    indicatorsContainer: () => classNames(
      COMBO_BOX_CLASS_NAMES.INDICATORS_CONTAINER,
      isReadOnly && `${COMBO_BOX_CLASS_NAMES.INDICATORS_CONTAINER}--readonly`,
    ),
    menu: () => COMBO_BOX_CLASS_NAMES.MENU,
    menuList: () => COMBO_BOX_CLASS_NAMES.MENU_LIST,
    group: () => COMBO_BOX_CLASS_NAMES.GROUP,
  }), [isReadOnly])

  const styles: StylesConfig<T, false, GroupBase<T>> = useMemo(() => ({
    menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 101 }),
  }), [])

  const selectProps = useMemo(() => ({
    inputId: effectiveInputId,
    className,
    value: selectedValue,
    onChange: onSelectedValueChange,
    options: options ?? groups,
    onInputChange: onInputValueChange,
    placeholder,
    unstyled: true,
    escapeClearsValue: true,
    menuPortalTarget: document.body,
    menuPlacement,
    classNames: selectClassNames,
    styles,
    components,
    isClearable: isClearable && !isReadOnly,
    isDisabled,
    isSearchable: isSearchable && !isReadOnly,
    isLoading: isLoading || isMutating,
    openMenuOnClick: !isReadOnly,
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
    groups,
    isClearable,
    isDisabled,
    isLoading,
    isMutating,
    isReadOnly,
    isSearchable,
    menuPlacement,
    onInputValueChange,
    onSelectedValueChange,
    options,
    placeholder,
    selectClassNames,
    selectedValue,
    styles,
  ])

  return selectProps
}
