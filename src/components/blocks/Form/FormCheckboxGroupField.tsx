import { Checkbox } from '@ui/Checkbox/Checkbox'
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
}

export function FormCheckboxGroupField<T extends string>({ options, ...props }: FormCheckboxGroupFieldProps<T>) {
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
        <VStack gap='xs'>
          {options.map(option => (
            <Checkbox key={option.value} value={option.value} size='lg'>
              {option.label}
            </Checkbox>
          ))}
        </VStack>
      </FormFieldShell>
    </CheckboxGroup>
  )
}
