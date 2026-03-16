import { type PropsWithChildren, useId } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { useFieldContext } from '@hooks/features/forms/useForm'
import { FieldError } from '@ui/Form/Form'
import { Radio, RadioGroup } from '@ui/RadioGroup/RadioGroup'
import { Stack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import type { CommonFormFieldProps } from '@components/forms/types'

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
  const { t } = useTranslation()
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
            <Span slot='description'>{t('common:no', 'No')}</Span>
          </Radio>
          <Radio<YesNoValue> value='yes'>
            <Span slot='description'>{t('common:yes', 'Yes')}</Span>
          </Radio>
        </Stack>
        {shouldShowErrorMessage && <FieldError>{errorMessage}</FieldError>}
      </VStack>
    </RadioGroup>
  )
}
