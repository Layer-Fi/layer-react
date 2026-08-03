import { type ReactNode } from 'react'

import { useFieldContext } from '@hooks/features/forms/useForm'
import { Switch } from '@ui/Switch/Switch'
import { FormFieldShell, useFormField } from '@blocks/Form/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/Form/types'

export type FormSwitchFieldProps = CommonFormFieldProps & {
  slots?: {
    LabelIcon?: ReactNode
  }
}

export function FormSwitchField({ slots, ...props }: FormSwitchFieldProps) {
  const field = useFieldContext<boolean>()

  const { state, handleChange, handleBlur } = field
  const { value } = state

  const { name, isInvalid, rootProps, shellProps } = useFormField(props)

  return (
    <Switch
      {...rootProps}
      isInvalid={isInvalid}
      isSelected={value}
      onChange={handleChange}
      onBlur={handleBlur}
      name={name}
    >
      <FormFieldShell {...shellProps} slots={slots} />
    </Switch>
  )
}
