import { useState, useEffect, type PropsWithChildren, useCallback } from 'react'
import { useFieldContext } from '../hooks/useForm'
import { Label } from '../../../components/ui/Typography/Text'
import { DateField, DateInput, DateSegment } from '../../../components/ui/Date/Date'
import { FieldError } from '../../../components/ui/Form/Form'
import type { CommonFormFieldProps } from '../types'
import type { ZonedDateTime } from '@internationalized/date'
import { InputGroup } from '../../../components/ui/Input/InputGroup'
import { VStack } from '../../../components/ui/Stack/Stack'

export type FormDateFieldProps = CommonFormFieldProps
export function FormDateField({
  label,
  className,
  inline = false,
  showLabel = true,
  showFieldError = true,
  isReadOnly = false,
}: PropsWithChildren<FormDateFieldProps>) {
  const field = useFieldContext<ZonedDateTime | null>()

  const { name, state, handleChange, handleBlur } = field
  const { meta, value } = state
  const { errors, isValid } = meta
  const [localDate, setLocalDate] = useState(value)

  useEffect(() => {
    setLocalDate(value)
  }, [value])

  const onBlur = useCallback(() => {
    handleChange(localDate)
    handleBlur()
  }, [handleBlur, handleChange, localDate])

  const errorMessage = errors.length !== 0 ? (errors[0] as string) : undefined
  const shouldShowErrorMessage = showFieldError && errorMessage

  const additionalAriaProps = !showLabel && { 'aria-label': label }
  return (
    <DateField
      name={name}
      granularity='day'
      value={localDate}
      isInvalid={!isValid}
      inline={inline}
      className={className}
      onChange={setLocalDate}
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
      <VStack gap='3xs'>
        <InputGroup slot='input'>
          <DateInput inset>
            {segment => <DateSegment isReadOnly={isReadOnly} segment={segment} />}
          </DateInput>
        </InputGroup>
        {shouldShowErrorMessage && <FieldError>{errorMessage}</FieldError>}
      </VStack>
    </DateField>
  )
}
