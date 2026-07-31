import type { PropsWithChildren } from 'react'

import { TextField, type TextFieldProps } from '@ui/Form/Form'
import { FormFieldShell, useFormField } from '@blocks/forms/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/forms/types'

export type BaseFormTextFieldProps = CommonFormFieldProps & {
  inputMode?: TextFieldProps['inputMode']
  isTextArea?: boolean
}

export function BaseFormTextField({
  isTextArea = false,
  inputMode,
  children,
  ...props
}: PropsWithChildren<BaseFormTextFieldProps>) {
  const { name, isInvalid, rootProps, shellProps } = useFormField(props)

  return (
    <TextField
      {...rootProps}
      name={name}
      inputMode={inputMode}
      isInvalid={isInvalid}
      textarea={isTextArea}
    >
      <FormFieldShell {...shellProps}>{children}</FormFieldShell>
    </TextField>
  )
}
