import { TextContext } from 'react-aria-components/Text'
import { useTranslation } from 'react-i18next'

import { Checkbox, type CheckboxLayout } from '@ui/Checkbox/Checkbox'
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

// The "Optional" tag replaces the string label that gives an inline checkbox its gap, so only rows may show it.
type CheckboxGroupLayoutProps =
  | { layout?: Exclude<CheckboxLayout, 'row'>, markOptional?: never }
  | { layout: 'row', markOptional?: boolean }

export type FormCheckboxGroupFieldProps<T extends string> = CommonFormFieldProps & CheckboxGroupLayoutProps & {
  options: CheckboxOption<T>[]
}

export function FormCheckboxGroupField<T extends string>({ options, layout, markOptional = false, ...props }: FormCheckboxGroupFieldProps<T>) {
  const { t } = useTranslation()
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
          {options.map(option => (
            <Checkbox key={option.value} value={option.value} size='lg' layout={layout} isRequired={option.isRequired}>
              {markOptional && !option.isRequired
                ? (
                  // The group hands every `Text` inside it a description or error slot; clearing it keeps these plain text.
                  <TextContext.Provider value={null}>
                    <HStack fluid justify='space-between' align='center' gap='xs'>
                      <Span>{option.label}</Span>
                      <Span size='sm' variant='subtle'>{t('common:label.optional', 'Optional')}</Span>
                    </HStack>
                  </TextContext.Provider>
                )
                : option.label}
            </Checkbox>
          ))}
        </VStack>
      </FormFieldShell>
    </CheckboxGroup>
  )
}
