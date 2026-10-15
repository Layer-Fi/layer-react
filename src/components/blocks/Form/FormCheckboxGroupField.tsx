import { Checkbox, type CheckboxLayout } from '@ui/Checkbox/Checkbox'
import { CheckboxGroup } from '@ui/CheckboxGroup/CheckboxGroup'
import { VStack } from '@ui/Stack/Stack'
import { FormFieldShell, useFormField } from '@blocks/Form/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/Form/types'

import { useFieldContext } from './formContexts'

export type CheckboxOption<T extends string> = {
  value: T
  label: string
}

export type FormCheckboxGroupFieldProps<T extends string> = CommonFormFieldProps & {
  options: CheckboxOption<T>[]
  layout?: CheckboxLayout
}

export function FormCheckboxGroupField<T extends string>({ options, layout, ...props }: FormCheckboxGroupFieldProps<T>) {
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
            <Checkbox key={option.value} value={option.value} size='lg' layout={layout}>
              {option.label}
            </Checkbox>
          ))}
        </VStack>
      </FormFieldShell>
    </CheckboxGroup>
  )
}
