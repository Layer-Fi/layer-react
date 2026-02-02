import { type PropsWithChildren, useId } from 'react'
import classNames from 'classnames'

import { FieldError } from '@ui/Form/Form'
import { Radio, RadioGroup } from '@ui/RadioGroup/RadioGroup'
import { Stack, VStack } from '@ui/Stack/Stack'
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

  const labelId = useId()
  const additionalAriaProps = showLabel
    ? { 'aria-labelledby': labelId }
    : { 'aria-label': label }

  const radioGroupClassNames = classNames(
    FORM_RADIO_GROUP_FIELD_CLASSNAME,
    inline && `${FORM_RADIO_GROUP_FIELD_CLASSNAME}--inline`,
    className,
  )

  const errorMessage = errors.length !== 0 ? (errors[0] as string) : undefined
  const shouldShowErrorMessage = showFieldError && errorMessage

  return (
    <RadioGroup<T>
      slot='radiogroup'
      value={value}
      onChange={handleChange}
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
          {options.map(option => (
            <Radio<T> key={option.value} value={option.value}>
              <Span slot='description'>{option.label}</Span>
            </Radio>
          ))}
        </Stack>
        {shouldShowErrorMessage && <FieldError>{errorMessage}</FieldError>}
      </VStack>
    </RadioGroup>
  )
}
