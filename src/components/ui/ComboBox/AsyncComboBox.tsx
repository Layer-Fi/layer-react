import Select from 'react-select'

import { ComboBoxErrorMessage } from '@ui/ComboBox/ComboBoxErrorMessage'
import type { AsyncSingleSelectComboBoxProps, ComboBoxOption } from '@ui/ComboBox/types'
import { useAsyncComboBoxOptions } from '@ui/ComboBox/useAsyncComboBoxOptions'
import { useCommonComboBoxProps } from '@ui/ComboBox/useCommonComboBoxProps'
import { VStack } from '@ui/Stack/Stack'

import './comboBox.scss'

export function AsyncComboBox<T extends ComboBoxOption>({
  className,
  slots,
  isError,
  isLoading,
  fetchOptions,
  selectedValue,
  onSelectedValueChange,
  ...props
}: AsyncSingleSelectComboBoxProps<T>) {
  const {
    options,
    isLoading: isLoadingOptions,
    isError: isErrorLoadingOptions,
    onInputValueChange,
    onMenuScrollToBottom,
  } = useAsyncComboBoxOptions({ fetchOptions })

  const effectiveIsError = isError || isErrorLoadingOptions

  const commonSelectProps = useCommonComboBoxProps<T, false>({
    className,
    slots,
    options,
    onInputValueChange,
    isError: effectiveIsError,
    isLoading: isLoading || isLoadingOptions,
    /* Options are filtered server-side; the default filter would hide results
     * matched on fields outside the label. */
    filterOption: null,
    ...props,
  })

  return (
    <VStack gap='3xs' fluid className={className ? `${className}__Container` : undefined}>
      <Select
        {...commonSelectProps}
        value={selectedValue}
        onChange={onSelectedValueChange}
        onMenuScrollToBottom={onMenuScrollToBottom}
      />
      <ComboBoxErrorMessage isError={effectiveIsError} errorMessage={slots?.ErrorMessage} />
    </VStack>
  )
}
