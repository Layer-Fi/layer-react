import { type ReactNode } from 'react'

import { useFieldContext } from '@hooks/features/forms/useForm'
import { Switch } from '@ui/Switch/Switch'
import { FormFieldShell, useFormField } from '@blocks/forms/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/forms/types'

export type FormSwitchFieldProps = CommonFormFieldProps & {
  slots?: {
    LabelIcon?: ReactNode
  }
}

export function FormSwitchField({ slots, ...props }: FormSwitchFieldProps) {
  const field = useFieldContext<boolean>()

  const { state, handleChange, handleBlur } = field
  const { value } = state

  const { name, rootProps, shellProps } = useFormField(props)

  return (
    <Switch
      {...rootProps}
      isSelected={value}
      onChange={handleChange}
      onBlur={handleBlur}
      name={name}
    >
      <FormFieldShell {...shellProps} slots={slots} />
    </Switch>
  )
}
