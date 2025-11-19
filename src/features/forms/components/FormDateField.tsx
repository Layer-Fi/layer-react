import { type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import type { DateValue } from '@internationalized/date'

import { DateField, DateInput, DateSegment } from '@ui/Date/Date'
import { FieldError } from '@ui/Form/Form'
import { InputGroup } from '@ui/Input/InputGroup'
import { Label } from '@ui/Typography/Text'
import { useFieldContext } from '@features/forms/hooks/useForm'
import type { CommonFormFieldProps } from '@features/forms/types'

export type FormDateFieldProps = CommonFormFieldProps
export function FormDateField<T extends DateValue>({
  label,
  className,
  inline = false,
  showLabel = true,
  showFieldError = true,
  isReadOnly = false,
}: PropsWithChildren<FormDateFieldProps>) {
  const field = useFieldContext<T | null>()

  const { name, state, handleChange, handleBlur } = field
  const { meta, value } = state
  const { errors, isValid } = meta
  const [localDate, setLocalDate] = useState<T | null>(value)

  useEffect(() => {
    setLocalDate(value)
  }, [value])

  const onChange = useCallback((newValue: DateValue | null) => {
    setLocalDate(newValue as T | null)
  }, [])

  const onBlur = useCallback(() => {
    handleChange(localDate)
    handleBlur()
  }, [handleBlur, handleChange, localDate])

  const errorMessage = errors.length !== 0 ? (errors[0] as string) : undefined
  const shouldShowErrorMessage = showFieldError && errorMessage

  const additionalAriaProps = !showLabel && { 'aria-label': label }
  return (
    <DateField<T>
      name={name}
      granularity='day'
      value={localDate}
      isInvalid={!isValid}
      inline={inline}
      className={className}
      onChange={onChange}
      onBlur={onBlur}
      isReadOnly={isReadOnly}
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
        <DateInput inset>
          {segment => <DateSegment isReadOnly={isReadOnly} segment={segment} />}
        </DateInput>
      </InputGroup>
      {shouldShowErrorMessage && <FieldError>{errorMessage}</FieldError>}
    </DateField>
  )
}
