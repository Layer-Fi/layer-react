import Select from 'react-select'

import { ComboBoxErrorMessage } from '@ui/ComboBox/ComboBoxErrorMessage'
import type { ComboBoxOption, SingleSelectComboBoxProps } from '@ui/ComboBox/types'
import { useCommonComboBoxProps } from '@ui/ComboBox/useCommonComboBoxProps'
import { VStack } from '@ui/Stack/Stack'

import './comboBox.scss'

export function ComboBox<T extends ComboBoxOption>({
  className,
  slots,
  isError,
  selectedValue,
  onSelectedValueChange,
  ...props
}: SingleSelectComboBoxProps<T>) {
  const commonSelectProps = useCommonComboBoxProps<T, false>({ className, slots, ...props })

  return (
    <VStack gap='3xs' fluid className={className ? `${className}__Container` : undefined}>
      <Select {...commonSelectProps} value={selectedValue} onChange={onSelectedValueChange} />
      <ComboBoxErrorMessage isError={isError} errorMessage={slots?.ErrorMessage} />
    </VStack>
  )
}
