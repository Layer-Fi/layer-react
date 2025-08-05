import { type PropsWithChildren } from 'react'
import { useFieldContext } from '../hooks/useForm'
import { CheckboxWithTooltip } from '../../../components/ui/Checkbox/Checkbox'
import { Label } from '../../../components/ui/Typography/Text'
import classNames from 'classnames'
import type { CommonFormFieldProps } from '../types'

export type FormCheckboxFieldProps = CommonFormFieldProps
const FORM_CHECKBOX_FIELD_CLASSNAME = 'Layer__FormCheckboxField'
export function FormCheckboxField({
  label,
  className,
  inline = false,
  showLabel = true,
  showFieldError = true,
  isReadOnly = false,
}: PropsWithChildren<FormCheckboxFieldProps>) {
  const field = useFieldContext<boolean>()

  const { name, state, handleChange, handleBlur } = field
  const { meta, value } = state
  const { errors, isValid } = meta

  const errorMessage = errors.length !== 0 ? (errors[0] as string) : undefined
  const tooltipProps = showFieldError ? { tooltip: errorMessage } : {}

  const additionalAriaProps = !showLabel && { 'aria-label': label }

  const checkboxClassNames = classNames(
    FORM_CHECKBOX_FIELD_CLASSNAME,
    inline && `${FORM_CHECKBOX_FIELD_CLASSNAME}--inline`,
    className,
  )

  return (
    <CheckboxWithTooltip
      className={checkboxClassNames}
      isSelected={value}
      isInvalid={!isValid}
      onChange={handleChange}
      onBlur={handleBlur}
      name={name}
      value={name}
      size='lg'
      isReadOnly={isReadOnly}
      {...tooltipProps}
      {...additionalAriaProps}
      {...(!isValid && { variant: 'error' })}
    >
      {showLabel && <Label slot='label' size='sm' htmlFor={name}>{label}</Label>}
    </CheckboxWithTooltip>
  )
}
