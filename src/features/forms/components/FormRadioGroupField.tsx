import { type PropsWithChildren } from 'react'
import classNames from 'classnames'

import { Radio, RadioGroup } from '@ui/RadioGroup/RadioGroup'
import { Label, Span } from '@ui/Typography/Text'
import { useFieldContext } from '@features/forms/hooks/useForm'
import type { CommonFormFieldProps } from '@features/forms/types'

import './formRadioGroupField.scss'

export type RadioOption<T extends string> = {
  value: T
  label: string
}

export type FormRadioGroupFieldProps<T extends string> = CommonFormFieldProps & {
  options: RadioOption<T>[]
  orientation?: 'horizontal' | 'vertical'
}

const FORM_RADIO_GROUP_FIELD_CLASSNAME = 'Layer__FormRadioGroupField'

export function FormRadioGroupField<T extends string>({
  label,
  className,
  inline = false,
  showLabel = true,
  showFieldError = true,
  isReadOnly = false,
  options,
  orientation = 'vertical',
}: PropsWithChildren<FormRadioGroupFieldProps<T>>) {
  const field = useFieldContext<T>()

  const { name, state, handleChange, handleBlur } = field
  const { meta, value } = state
  const { errors, isValid } = meta

  const errorMessage = errors.length !== 0 ? (errors[0] as string) : undefined

  const additionalAriaProps = !showLabel && { 'aria-label': label }

  const radioGroupClassNames = classNames(
    FORM_RADIO_GROUP_FIELD_CLASSNAME,
    inline && `${FORM_RADIO_GROUP_FIELD_CLASSNAME}--inline`,
    className,
  )

  return (
    <div className={radioGroupClassNames}>
      {showLabel && <Label slot='label' size='sm' htmlFor={name}>{label}</Label>}
      <RadioGroup<T>
        slot='radiogroup'
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        name={name}
        orientation={orientation}
        isReadOnly={isReadOnly}
        isInvalid={!isValid}
        {...additionalAriaProps}
      >
        {options.map(option => (
          <Radio<T> key={option.value} value={option.value} size='md'>
            <Span size='md' slot='description'>{option.label}</Span>
          </Radio>
        ))}
      </RadioGroup>
      {showFieldError && errorMessage && (
        <span slot='error' className={`${FORM_RADIO_GROUP_FIELD_CLASSNAME}__Error`}>
          {errorMessage}
        </span>
      )}
    </div>
  )
}
