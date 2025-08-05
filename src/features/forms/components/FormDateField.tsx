import { useState, useEffect, type PropsWithChildren, useCallback } from 'react'
import { useFieldContext } from '../hooks/useForm'
import { Label } from '../../../components/ui/Typography/Text'
import { DateField, DateInput, DateSegment } from '../../../components/ui/Date/Date'
import { FieldError } from '../../../components/ui/Form/Form'
import type { CommonFormFieldProps } from '../types'
import type { ZonedDateTime } from '@internationalized/date'
import { InputGroup } from '../../../components/ui/Input/InputGroup'
import { isZonedDateTime } from '../../../utils/time/timeUtils'

export type FormDateFieldProps = CommonFormFieldProps
export function FormDateField({
  label,
  className,
  inline = false,
  showLabel = true,
  showFieldError = true,
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
    const nextDate = isZonedDateTime(localDate) ? localDate : null
    handleChange(nextDate)
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
      {...additionalAriaProps}
      onChange={setLocalDate}
      onBlur={onBlur}
    >
      {showLabel && <Label size='sm' htmlFor={name} {...(!inline && { pbe: '3xs' })}>{label}</Label>}
      <InputGroup>
        <DateInput inset>
          {segment => <DateSegment segment={segment} />}
        </DateInput>
      </InputGroup>
      {shouldShowErrorMessage && <FieldError>{errorMessage}</FieldError>}
    </DateField>
  )
}
