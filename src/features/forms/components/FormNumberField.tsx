import { type PropsWithChildren, useCallback } from 'react'

import { FieldError } from '@ui/Form/Form'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { NumberField } from '@ui/NumberField/NumberField'
import { Label } from '@ui/Typography/Text'
import { useFieldContext } from '@features/forms/hooks/useForm'
import type { CommonFormFieldProps } from '@features/forms/types'

export type FormNumberFieldProps = CommonFormFieldProps & {
  minValue?: number
  maxValue?: number
}

export function FormNumberField({
  label,
  className,
  inline = false,
  showLabel = true,
  showFieldError = true,
  isReadOnly = false,
  minValue,
  maxValue,
}: PropsWithChildren<FormNumberFieldProps>) {
  const field = useFieldContext<number>()

  const { name, state, handleChange, handleBlur } = field
  const { meta, value } = state
  const { errors, isValid } = meta

  const onChange = useCallback((newValue: number) => {
    handleChange(newValue)
  }, [handleChange])

  const errorMessage = errors.length !== 0 ? (errors[0] as string) : undefined
  const shouldShowErrorMessage = showFieldError && errorMessage

  const additionalAriaProps = !showLabel && { 'aria-label': label }

  return (
    <NumberField
      name={name}
      value={value}
      isInvalid={!isValid}
      inline={inline}
      className={className}
      onChange={onChange}
      onBlur={handleBlur}
      isReadOnly={isReadOnly}
      minValue={minValue}
      maxValue={maxValue}
      formatOptions={{ useGrouping: false }}
      {...additionalAriaProps}
    >
      {showLabel && (
        <Label
          slot='label'
          size='sm'
          htmlFor={name}
          {...(!inline && { pbe: '3xs' })}
        >
          {label}
        </Label>
      )}
      <InputGroup slot='input'>
        <Input inset />
      </InputGroup>
      {shouldShowErrorMessage && <FieldError>{errorMessage}</FieldError>}
    </NumberField>
  )
}
