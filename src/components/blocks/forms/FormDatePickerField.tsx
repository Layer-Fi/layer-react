import { useCallback, useEffect, useState } from 'react'
import type { DateValue } from '@internationalized/date'

import { useFieldContext } from '@hooks/features/forms/useForm'
import { DatePicker } from '@ui/DatePickers/DatePicker/DatePicker'
import { FormFieldError, useFormField } from '@blocks/forms/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/forms/types'

export type FormDatePickerFieldProps = CommonFormFieldProps & {
  minDate?: DateValue | null
  maxDate?: DateValue | null
}

export function FormDatePickerField<T extends DateValue>({
  minDate,
  maxDate,
  ...props
}: FormDatePickerFieldProps) {
  const field = useFieldContext<T | null>()

  const { state, handleChange, handleBlur } = field
  const { value } = state
  const [localDate, setLocalDate] = useState<T | null>(value)

  useEffect(() => {
    setLocalDate(value)
  }, [value])

  const onChange = useCallback((newValue: T | null) => {
    setLocalDate(newValue)
  }, [])

  const onBlur = useCallback(() => {
    handleChange(localDate)
    handleBlur()
  }, [handleBlur, handleChange, localDate])

  const { isInvalid, rootProps, shellProps } = useFormField(props)
  const { showLabel, showFieldError, errorMessage } = shellProps

  // DatePicker renders its own label and control, so the error is injected through `slots`
  // rather than composed by `FormFieldShell`.
  return (
    <DatePicker
      {...rootProps}
      label={props.label}
      showLabel={showLabel}
      date={localDate}
      onChange={onChange}
      onBlur={onBlur}
      minDate={minDate}
      maxDate={maxDate}
      isInvalid={isInvalid}
      slots={{
        ErrorMessage: showFieldError && errorMessage
          ? <FormFieldError>{errorMessage}</FormFieldError>
          : null,
      }}
    />
  )
}
