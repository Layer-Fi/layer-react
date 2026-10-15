import { TextContext } from 'react-aria-components/Text'
import { useTranslation } from 'react-i18next'

import { Checkbox, type CheckboxVariant } from '@ui/Checkbox/Checkbox'
import { CheckboxGroup } from '@ui/CheckboxGroup/CheckboxGroup'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { FormFieldShell, useFormField } from '@blocks/Form/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/Form/types'

import { useFieldContext } from './formContexts'

export type CheckboxOption<T extends string> = {
  value: T
  label: string
  isRequired?: boolean
}

type CheckboxGroupVariantProps =
  | { variant?: Exclude<CheckboxVariant, 'row'>, markOptional?: never }
  | { variant: 'row', markOptional?: boolean }

export type FormCheckboxGroupFieldProps<T extends string> = CommonFormFieldProps & CheckboxGroupVariantProps & {
  options: CheckboxOption<T>[]
}

const OptionalLabel = ({ label }: { label: string }) => {
  const { t } = useTranslation()

  return (
    <TextContext.Provider value={null}>
      <HStack fluid justify='space-between' align='center' gap='xs'>
        <Span>{label}</Span>
        <Span size='sm' variant='subtle'>{t('common:label.optional', 'Optional')}</Span>
      </HStack>
    </TextContext.Provider>
  )
}

export function FormCheckboxGroupField<T extends string>({ options, variant, markOptional = false, ...props }: FormCheckboxGroupFieldProps<T>) {
  const field = useFieldContext<T[]>()

  const { state, handleChange, handleBlur } = field
  const { value } = state

  const { name, isInvalid, labelId, rootProps, shellProps } = useFormField(props)

  return (
    <CheckboxGroup<T>
      {...rootProps}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      name={name}
      isInvalid={isInvalid}
      {...(props.showLabel !== false && { 'aria-labelledby': labelId })}
    >
      <FormFieldShell {...shellProps} labelId={labelId}>
        <VStack slot='options' gap='xs'>
          {options.map(({ value, label, isRequired }) => {
            const isTagged = markOptional && !isRequired

            return (
              <Checkbox key={value} value={value} size='lg' variant={variant} isRequired={isRequired}>
                {isTagged ? <OptionalLabel label={label} /> : label}
              </Checkbox>
            )
          })}
        </VStack>
      </FormFieldShell>
    </CheckboxGroup>
  )
}
