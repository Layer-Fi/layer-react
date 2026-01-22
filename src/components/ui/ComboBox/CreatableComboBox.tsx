import { type GroupBase } from 'react-select'
import CreatableSelect, { type CreatableProps } from 'react-select/creatable'

import { ComboBoxErrorMessage } from '@ui/ComboBox/ComboBoxErrorMessage'
import type { ComboBoxOption, SingleSelectComboBoxProps } from '@ui/ComboBox/types'
import { useCommonComboBoxProps } from '@ui/ComboBox/useCommonComboBoxProps'
import { VStack } from '@ui/Stack/Stack'

import './comboBox.scss'

export type AllowedCreatableProps<T extends ComboBoxOption> = Pick<
  CreatableProps<T, false, GroupBase<T>>,
  | 'onCreateOption'
  | 'formatCreateLabel'
  | 'createOptionPosition'
  | 'isValidNewOption'
>

type CreatableComboBoxProps<T extends ComboBoxOption> = SingleSelectComboBoxProps<T> & AllowedCreatableProps<T>

//  Always show the create option button by default
const returnTrue = () => true

export function CreatableComboBox<T extends ComboBoxOption>({
  className,
  slots,
  isError,
  selectedValue,
  onSelectedValueChange,
  onCreateOption,
  formatCreateLabel,
  createOptionPosition = 'first',
  isValidNewOption = returnTrue,
  ...props
}: CreatableComboBoxProps<T>) {
  const commonSelectProps = useCommonComboBoxProps<T, false>({ className, slots, ...props })

  return (
    <VStack gap='3xs' fluid className={className ? `${className}__Container` : undefined}>
      <CreatableSelect
        {...commonSelectProps}
        value={selectedValue}
        onChange={onSelectedValueChange}
        onCreateOption={onCreateOption}
        isValidNewOption={isValidNewOption}
        formatCreateLabel={formatCreateLabel}
        createOptionPosition={createOptionPosition}
      />
      <ComboBoxErrorMessage isError={isError} errorMessage={slots?.ErrorMessage} />
    </VStack>
  )
}
