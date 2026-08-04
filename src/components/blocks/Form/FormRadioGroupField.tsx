import { useFieldContext } from '@hooks/features/forms/useForm'
import { Radio, RadioGroup } from '@ui/RadioGroup/RadioGroup'
import { Stack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { FormFieldShell, useFormField } from '@blocks/Form/FormFieldShell'
import type { CommonFormFieldProps } from '@blocks/Form/types'

export type RadioOption<T extends string> = {
  value: T
  label: string
}

export type FormRadioGroupFieldProps<T extends string> = CommonFormFieldProps & {
  options: RadioOption<T>[]
  orientation?: 'horizontal' | 'vertical'
}

export function FormRadioGroupField<T extends string>({
  options,
  orientation = 'vertical',
  ...props
}: FormRadioGroupFieldProps<T>) {
  const field = useFieldContext<T>()

  const { state, handleChange, handleBlur } = field
  const { value } = state

  const { name, isInvalid, labelId, rootProps, shellProps } = useFormField(props)

  return (
    <RadioGroup<T>
      {...rootProps}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      name={name}
      orientation={orientation}
      isInvalid={isInvalid}
      {...(props.showLabel !== false && { 'aria-labelledby': labelId })}
    >
      <FormFieldShell {...shellProps} labelId={labelId}>
        <Stack
          slot='options'
          direction={orientation === 'horizontal' ? 'row' : 'column'}
          gap={orientation === 'horizontal' ? 'sm' : 'xs'}
        >
          {options.map(option => (
            <Radio<T> key={option.value} value={option.value}>
              <Span slot='description'>{option.label}</Span>
            </Radio>
          ))}
        </Stack>
      </FormFieldShell>
    </RadioGroup>
  )
}
