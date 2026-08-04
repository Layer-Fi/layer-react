export interface CommonFormFieldProps {
  label: string
  className?: string
  inline?: boolean
  align?: 'start' | 'center'
  showLabel?: boolean
  showFieldError?: boolean
  isReadOnly?: boolean
  isDisabled?: boolean
  errorText?: string
}
