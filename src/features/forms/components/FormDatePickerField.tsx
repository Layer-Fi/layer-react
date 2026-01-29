import { type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import type { ZonedDateTime } from '@internationalized/date'
import classNames from 'classnames'

import { DatePicker } from '@components/DatePicker/DatePicker'
import { useFieldContext } from '@features/forms/hooks/useForm'
import type { CommonFormFieldProps } from '@features/forms/types'

import './formDatePickerField.scss'

export type FormDatePickerFieldProps = CommonFormFieldProps & {
  minDate?: ZonedDateTime | null
  maxDate?: ZonedDateTime | null
}

const FORM_DATE_PICKER_FIELD_CLASSNAME = 'Layer__FormDatePickerField'

export function FormDatePickerField({
  label,
  className,
  inline = false,
  showLabel = true,
  showFieldError = true,
  isReadOnly = false,
  minDate,
  maxDate,
}: PropsWithChildren<FormDatePickerFieldProps>) {
  const field = useFieldContext<ZonedDateTime | null>()

  const { state, handleChange, handleBlur } = field
  const { meta, value } = state
  const { errors, isValid } = meta
  const [localDate, setLocalDate] = useState<ZonedDateTime | null>(value)

  useEffect(() => {
    setLocalDate(value)
  }, [value])

  const onChange = useCallback((newValue: ZonedDateTime | null) => {
    setLocalDate(newValue)
    handleChange(newValue)
  }, [handleChange])

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
      onBlur={handleBlur}
      minDate={minDate}
      maxDate={maxDate}
      isInvalid={!isValid}
      errorText={shouldShowErrorMessage ? errorMessage : null}
      isReadOnly={isReadOnly}
      className={datePickerClassNames}
    />
  )
}
