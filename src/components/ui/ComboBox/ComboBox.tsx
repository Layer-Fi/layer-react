import Select from 'react-select'

import { ComboBoxErrorMessage } from '@ui/ComboBox/ComboBoxErrorMessage'
import type { BaseComboBoxProps, ComboBoxOption } from '@ui/ComboBox/types'
import { useCommonComboBoxProps } from '@ui/ComboBox/useCommonComboBoxProps'
import { VStack } from '@ui/Stack/Stack'

import './comboBox.scss'

export function ComboBox<T extends ComboBoxOption>({
  className,
  slots,
  isError,
  ...props
}: BaseComboBoxProps<T>) {
  const selectProps = useCommonComboBoxProps<T>({ className, slots, ...props })

  return (
    <VStack gap='3xs' fluid className={className ? `${className}__Container` : undefined}>
      <Select {...selectProps} />
      <ComboBoxErrorMessage isError={isError} errorMessage={slots?.ErrorMessage} />
    </VStack>
  )
}
