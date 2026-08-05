import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Radio, RadioGroup } from '@ui/RadioGroup/RadioGroup'
import { Stack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { FormFieldShell, useFormField } from '@blocks/Form/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/Form/types'

import { useFieldContext } from './formContexts'

type YesNoValue = 'yes' | 'no'

export type FormRadioGroupYesNoFieldProps = CommonFormFieldProps & {
  orientation?: 'horizontal' | 'vertical'
}

export function FormRadioGroupYesNoField({
  orientation = 'horizontal',
  ...props
}: FormRadioGroupYesNoFieldProps) {
  const { t } = useTranslation()
  const field = useFieldContext<boolean>()

  const { state, handleChange, handleBlur } = field
  const { value } = state

  const onChange = useCallback((newValue: YesNoValue) => {
    handleChange(newValue === 'yes')
  }, [handleChange])

  const { name, isInvalid, labelId, rootProps, shellProps } = useFormField(props)

  return (
    <RadioGroup<YesNoValue>
      {...rootProps}
      value={value ? 'yes' : 'no'}
      onChange={onChange}
      onBlur={handleBlur}
      name={name}
      orientation={orientation}
      isInvalid={isInvalid}
      {...(props.showLabel !== false && { 'aria-labelledby': labelId })}
    >
      <FormFieldShell {...shellProps} labelId={labelId}>
        <Stack
          slot='options'
          direction={orientation === 'horizontal' ? 'row' : 'column'}
          gap={orientation === 'horizontal' ? 'sm' : 'xs'}
        >
          <Radio<YesNoValue> value='no'>
            <Span slot='description'>{t('common:label.no', 'No')}</Span>
          </Radio>
          <Radio<YesNoValue> value='yes'>
            <Span slot='description'>{t('common:label.yes', 'Yes')}</Span>
          </Radio>
        </Stack>
      </FormFieldShell>
    </RadioGroup>
  )
}
