import { useFieldContext } from '@hooks/features/forms/useForm'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { FormFieldShell, useFormField } from '@blocks/Form/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/Form/types'

export type FormCheckboxFieldProps = CommonFormFieldProps

export function FormCheckboxField(props: FormCheckboxFieldProps) {
  const field = useFieldContext<boolean>()

  const { state, handleChange, handleBlur } = field
  const { value } = state

  const { name, isInvalid, rootProps, shellProps } = useFormField(props)

  return (
    <Checkbox
      {...rootProps}
      isSelected={value}
      isInvalid={isInvalid}
      onChange={handleChange}
      onBlur={handleBlur}
      name={name}
      value={name}
      size='lg'
    >
      <FormFieldShell {...shellProps} />
    </Checkbox>
  )
}
