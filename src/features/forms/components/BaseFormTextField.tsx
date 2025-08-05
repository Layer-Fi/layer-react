import type { PropsWithChildren } from 'react'
import { FieldError, TextField, type TextFieldProps } from '../../../components/ui/Form/Form'
import { Label } from '../../../components/ui/Typography/Text'
import { useFieldContext } from '../hooks/useForm'
import type { CommonFormFieldProps } from '../types'

export type BaseFormTextFieldProps = CommonFormFieldProps & {
  inputMode?: TextFieldProps['inputMode']
  isTextArea?: boolean
}

export function BaseFormTextField({
  label,
  inline = false,
  showLabel = true,
  showFieldError = true,
  isTextArea = false,
  className,
  children,
}: PropsWithChildren<BaseFormTextFieldProps>) {
  const field = useFieldContext<string>()

  const { name, state } = field
  const { meta } = state
  const { errors, isValid } = meta

  const errorMessage = errors.length !== 0 ? (errors[0] as string) : undefined
  const shouldShowErrorMessage = showFieldError && errorMessage

  const additionalAriaProps = !showLabel && { 'aria-label': label }
  return (
    <TextField
      name={name}
      isInvalid={!isValid}
      inline={inline}
      className={className}
      textarea={isTextArea}
      {...additionalAriaProps}
    >
      {showLabel && <Label size='sm' htmlFor={name} {...(!inline && { pbe: '3xs' })}>{label}</Label>}
      {children}
      {shouldShowErrorMessage && <FieldError>{errorMessage}</FieldError>}
    </TextField>
  )
}
