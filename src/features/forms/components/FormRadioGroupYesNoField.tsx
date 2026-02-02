import { type PropsWithChildren, useId } from 'react'
import classNames from 'classnames'

import { FieldError } from '@ui/Form/Form'
import { Radio, RadioGroup } from '@ui/RadioGroup/RadioGroup'
import { Stack, VStack } from '@ui/Stack/Stack'
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
  const shouldShowErrorMessage = showFieldError && errorMessage

  const labelId = useId()
  const additionalAriaProps = showLabel
    ? { 'aria-labelledby': labelId }
    : { 'aria-label': label }

  const radioGroupClassNames = classNames(
    FORM_RADIO_GROUP_FIELD_CLASSNAME,
    inline && `${FORM_RADIO_GROUP_FIELD_CLASSNAME}--inline`,
    className,
  )

  const radioValue: YesNoValue = value ? 'yes' : 'no'

  const handleRadioChange = (newValue: YesNoValue) => {
    handleChange(newValue === 'yes')
  }

  return (
    <RadioGroup<YesNoValue>
      slot='radiogroup'
      value={radioValue}
      onChange={handleRadioChange}
      onBlur={handleBlur}
      name={name}
      orientation={orientation}
      isReadOnly={isReadOnly}
      isInvalid={!isValid}
      className={radioGroupClassNames}
      {...additionalAriaProps}
    >
      {showLabel && <Label slot='label' size='sm' id={labelId}>{label}</Label>}
      <VStack slot='options' gap='3xs'>
        <Stack direction={orientation === 'horizontal' ? 'row' : 'column'} gap={orientation === 'horizontal' ? 'sm' : 'xs'}>
          <Radio<YesNoValue> value='no'>
            <Span slot='description'>No</Span>
          </Radio>
          <Radio<YesNoValue> value='yes'>
            <Span slot='description'>Yes</Span>
          </Radio>
        </Stack>
        {shouldShowErrorMessage && <FieldError>{errorMessage}</FieldError>}
      </VStack>
    </RadioGroup>
  )
}
