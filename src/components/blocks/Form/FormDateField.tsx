import { useCallback, useEffect, useState } from 'react'
import type { DateValue } from '@internationalized/date'

import { DateField, DateInput, DateSegment } from '@ui/Date/Date'
import { InputGroup } from '@ui/Input/InputGroup'
import { FormFieldShell, useFormField } from '@blocks/Form/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/Form/types'

import { useFieldContext } from './formContexts'

export type FormDateFieldProps = CommonFormFieldProps

export function FormDateField<T extends DateValue>(props: FormDateFieldProps) {
  const field = useFieldContext<T | null>()

  const { state, handleChange, handleBlur } = field
  const { value } = state
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

  const { name, isInvalid, rootProps, shellProps } = useFormField(props)

  return (
    <DateField<T>
      {...rootProps}
      name={name}
      granularity='day'
      value={localDate}
      isInvalid={isInvalid}
      onChange={onChange}
      onBlur={onBlur}
    >
      <FormFieldShell {...shellProps}>
        <InputGroup slot='input'>
          <DateInput inset>
            {segment => <DateSegment isReadOnly={props.isReadOnly} segment={segment} />}
          </DateInput>
        </InputGroup>
      </FormFieldShell>
    </DateField>
  )
}
