import { type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import type { DateValue } from '@internationalized/date'
import classNames from 'classnames'

import { useFieldContext } from '@hooks/features/forms/useForm'
import { DatePicker } from '@components/DatePicker/DatePicker'
import type { CommonFormFieldProps } from '@components/forms/types'

import './formDatePickerField.scss'

export type FormDatePickerFieldProps = CommonFormFieldProps & {
  minDate?: DateValue | null
  maxDate?: DateValue | null
}

const FORM_DATE_PICKER_FIELD_CLASSNAME = 'Layer__FormDatePickerField'

export function FormDatePickerField<T extends DateValue>({
  label,
  className,
  inline = false,
  showLabel = true,
  showFieldError = true,
  isReadOnly = false,
  minDate,
  maxDate,
}: PropsWithChildren<FormDatePickerFieldProps>) {
  const field = useFieldContext<T | null>()

  const { state, handleChange, handleBlur } = field
  const { meta, value } = state
  const { errors, isValid } = meta
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

  const errorMessage = errors.length !== 0 ? (errors[0] as string) : undefined
  const shouldShowErrorMessage = showFieldError && errorMessage

  const datePickerClassNames = classNames(
    FORM_DATE_PICKER_FIELD_CLASSNAME,
    inline && `${FORM_DATE_PICKER_FIELD_CLASSNAME}--inline`,
    className,
  )

  return (
    <DatePicker
      label={label}
      showLabel={showLabel}
      date={localDate}
      onChange={onChange}
      onBlur={onBlur}
      minDate={minDate}
      maxDate={maxDate}
      isInvalid={!isValid}
      errorText={shouldShowErrorMessage ? errorMessage : null}
      isReadOnly={isReadOnly}
      className={datePickerClassNames}
    />
  )
}
