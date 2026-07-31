import { useCallback } from 'react'

import { useFieldContext } from '@hooks/features/forms/useForm'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { NumberField } from '@ui/NumberField/NumberField'
import { FormFieldShell, useFormField } from '@blocks/forms/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/forms/types'

export type FormNumberFieldProps = CommonFormFieldProps & {
  minValue?: number
  maxValue?: number
  placeholder?: string
}

export function FormNumberField({
  minValue,
  maxValue,
  placeholder,
  ...props
}: FormNumberFieldProps) {
  const field = useFieldContext<number>()

  const { state, handleChange, handleBlur } = field
  const { value } = state

  const onChange = useCallback((newValue: number) => {
    handleChange(newValue)
  }, [handleChange])

  const { name, isInvalid, rootProps, shellProps } = useFormField(props)

  return (
    <NumberField
      {...rootProps}
      name={name}
      value={value}
      isInvalid={isInvalid}
      onChange={onChange}
      onBlur={handleBlur}
      minValue={minValue}
      maxValue={maxValue}
      formatOptions={{ useGrouping: false }}
    >
      <FormFieldShell {...shellProps}>
        <InputGroup slot='input'>
          <Input inset placeholder={placeholder} />
        </InputGroup>
      </FormFieldShell>
    </NumberField>
  )
}
