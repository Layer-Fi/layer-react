import { useMemo } from 'react'
import Select from 'react-select'

import { ComboBoxErrorMessage } from '@ui/ComboBox/ComboBoxErrorMessage'
import type { ComboBoxOption, MultiSelectComboBoxProps } from '@ui/ComboBox/types'
import { useCommonComboBoxProps } from '@ui/ComboBox/useCommonComboBoxProps'
import { useMultiSelectComboBoxSubcomponents } from '@ui/ComboBox/useMultiSelectComboBoxSubcomponents'
import { VStack } from '@ui/Stack/Stack'

import './comboBox.scss'

export function MultiSelectComboBox<T extends ComboBoxOption>({
  className,
  slots,
  isError,
  selectedValues,
  onSelectedValuesChange,
  ...props
}: MultiSelectComboBoxProps<T>) {
  const commonSelectProps = useCommonComboBoxProps<T, true>({ className, slots, isError, ...props })
  const multiSelectComponents = useMultiSelectComboBoxSubcomponents<T>()

  const components = useMemo(() => ({
    ...commonSelectProps.components,
    ...multiSelectComponents,
  }), [commonSelectProps.components, multiSelectComponents])

  return (
    <VStack gap='3xs' fluid className={className ? `${className}__Container` : undefined}>
      <Select<T, true>
        {...commonSelectProps}
        components={components}
        value={selectedValues}
        onChange={onSelectedValuesChange}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        isMulti
      />
      <ComboBoxErrorMessage isError={isError} errorMessage={slots?.ErrorMessage} />
    </VStack>
  )
}
