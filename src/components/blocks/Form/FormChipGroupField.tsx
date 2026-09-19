import { type ReactNode } from 'react'

import { Chip, ChipGroup, type ChipSize } from '@ui/Chip/Chip'
import { formFieldLayoutProps, FormFieldShell, useFormField } from '@blocks/Form/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/Form/types'

import { useFieldContext } from './formContexts'

export type ChipOption<T extends string> = {
  value: T
  label: ReactNode
}

export type FormChipGroupFieldProps<T extends string> = CommonFormFieldProps & {
  options: ChipOption<T>[]
  size?: ChipSize
  /** Fires on every pick, including pressing the chip that is already selected. */
  onSelect?: (value: T) => void
}

export function FormChipGroupField<T extends string>({
  options,
  size,
  onSelect,
  ...props
}: FormChipGroupFieldProps<T>) {
  const field = useFieldContext<T | null>()

  const { state, handleChange } = field
  const { value } = state

  const { labelId, shellProps } = useFormField(props)
  const { label, isDisabled, className, inline, align, showLabel } = props

  return (
    <div {...formFieldLayoutProps({ className, inline, align, showLabel })}>
      <FormFieldShell {...shellProps} labelId={labelId}>
        <ChipGroup<T>
          ariaLabel={label}
          value={value}
          onChange={(next) => {
            handleChange(next)
            onSelect?.(next)
          }}
          isDisabled={isDisabled}
        >
          {options.map(option => (
            <Chip<T>
              key={option.value}
              size={size}
              value={option.value}
              onReselect={onSelect ? () => onSelect(option.value) : undefined}
            >
              {option.label}
            </Chip>
          ))}
        </ChipGroup>
      </FormFieldShell>
    </div>
  )
}
