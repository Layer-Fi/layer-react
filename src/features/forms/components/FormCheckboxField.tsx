import { useCallback, type PropsWithChildren } from 'react'
import { useFieldContext } from '../hooks/useForm'
import { CheckboxWithTooltip } from '../../../components/ui/Checkbox/Checkbox'
import { Label } from '../../../components/ui/Typography/Text'
import classNames from 'classnames'

export interface FormCheckboxField {
  label: string
  className?: string
  inline?: boolean
  showLabel?: boolean
  showErrorInTooltip?: boolean
}

const FORM_CHECKBOX_FIELD_CLASSNAME = 'Layer__FormCheckboxField'
export function FormCheckboxField({
  label,
  className,
  inline = false,
  showLabel = true,
  showErrorInTooltip = true,
}: PropsWithChildren<FormCheckboxField>) {
  const field = useFieldContext<boolean>()

  const { name, state, handleChange, handleBlur } = field
  const { meta, value } = state
  const { errors, isValid } = meta

  const errorMessage = errors.length !== 0 ? (errors[0] as string) : undefined
  const tooltipProps = showErrorInTooltip ? { tooltip: errorMessage } : {}

  const additionalAriaProps = !showLabel && { 'aria-label': label }

  const checkboxClassNames = classNames(
    FORM_CHECKBOX_FIELD_CLASSNAME,
    inline && `${FORM_CHECKBOX_FIELD_CLASSNAME}--inline`,
    className,
  )

  const onChange = useCallback((isSelected: boolean) => {
    handleChange(isSelected)
  }, [handleChange])

  return (
    <CheckboxWithTooltip
      className={checkboxClassNames}
      isSelected={value}
      isInvalid={!isValid}
      onChange={onChange}
      onBlur={handleBlur}
      name={name}
      value={name}
      size='lg'
      {...tooltipProps}
      {...additionalAriaProps}
      {...(!isValid && { variant: 'error' })}
    >
      {showLabel && <Label slot='label' size='sm' htmlFor={name}>{label}</Label>}
    </CheckboxWithTooltip>
  )
}
