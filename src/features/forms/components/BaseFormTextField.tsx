import type { PropsWithChildren } from 'react'
import { FieldError, TextField, type TextFieldProps } from '../../../components/ui/Form/Form'
import { Label } from '../../../components/ui/Typography/Text'
import { useFieldContext } from '../hooks/useForm'

export interface BaseFormTextFieldProps {
  label: string
  className?: string
  inline?: boolean
  showLabel?: boolean
  showFieldError?: boolean
  inputMode?: TextFieldProps['inputMode']
  isTextArea?: boolean
}

export function BaseFormTextField<TData>({
  label,
  className,
  inline = false,
  showLabel = true,
  showFieldError = true,
  isTextArea = false,
  children,
}: PropsWithChildren<BaseFormTextFieldProps>) {
  const field = useFieldContext<TData>()

  const { name, state } = field
  const { meta } = state
  const { errors, isValid } = meta

  const errorMessage = errors.length !== 0 ? (errors[0] as string) : undefined
  const shouldShowErrorMessage = showFieldError && errorMessage

  return (
    <TextField name={name} isInvalid={!isValid} inline={inline} className={className} textarea={isTextArea}>
      {showLabel && <Label size='sm' htmlFor={name} {...(!inline && { pbe: '3xs' })}>{label}</Label>}
      {children}
      {shouldShowErrorMessage && <FieldError>{errorMessage}</FieldError>}
    </TextField>
  )
}
