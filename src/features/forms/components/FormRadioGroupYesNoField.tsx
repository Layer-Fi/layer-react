import { type PropsWithChildren, useId } from 'react'
import classNames from 'classnames'

import { Radio, RadioGroup } from '@ui/RadioGroup/RadioGroup'
import { Label, Span } from '@ui/Typography/Text'
import { useFieldContext } from '@features/forms/hooks/useForm'
import type { CommonFormFieldProps } from '@features/forms/types'

import './formRadioGroupField.scss'

type YesNoValue = 'yes' | 'no'

export type FormRadioGroupYesNoFieldProps = CommonFormFieldProps & {
  orientation?: 'horizontal' | 'vertical'
}

const FORM_RADIO_GROUP_FIELD_CLASSNAME = 'Layer__FormRadioGroupField'

export function FormRadioGroupYesNoField({
  label,
  className,
  inline = false,
  showLabel = true,
  showFieldError = true,
  isReadOnly = false,
  orientation = 'horizontal',
}: PropsWithChildren<FormRadioGroupYesNoFieldProps>) {
  const field = useFieldContext<boolean>()

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

  const radioValue: YesNoValue = value ? 'yes' : 'no'

  const handleRadioChange = (newValue: YesNoValue) => {
    handleChange(newValue === 'yes')
  }

  const labelId = useId()

  return (
    <div className={radioGroupClassNames}>
      {showLabel && <Label slot='label' size='sm' id={labelId}>{label}</Label>}
      <RadioGroup<YesNoValue>
        slot='radiogroup'
        value={radioValue}
        onChange={handleRadioChange}
        onBlur={handleBlur}
        name={name}
        orientation={orientation}
        isReadOnly={isReadOnly}
        isInvalid={!isValid}
        {...additionalAriaProps}
        aria-labelledby={labelId}
      >
        <Radio<YesNoValue> value='no' size='md'>
          <Span size='md' slot='description'>No</Span>
        </Radio>
        <Radio<YesNoValue> value='yes' size='md'>
          <Span size='md' slot='description'>Yes</Span>
        </Radio>
      </RadioGroup>
      {showFieldError && errorMessage && (
        <span slot='error' className={`${FORM_RADIO_GROUP_FIELD_CLASSNAME}__Error`}>
          {errorMessage}
        </span>
      )}
    </div>
  )
}
