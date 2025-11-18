import { useCallback } from 'react'

import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { BaseFormTextField, type BaseFormTextFieldProps } from '@features/forms/components/BaseFormTextField'
import { useFieldContext } from '@features/forms/hooks/useForm'

type FormTextFieldProps = Omit<BaseFormTextFieldProps, 'isTextArea'>
export function FormTextField(props: FormTextFieldProps) {
  const field = useFieldContext<string>()

  const { name, state, handleChange, handleBlur } = field
  const { value } = state

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e.target.value)
  }, [handleChange])

  return (
    <BaseFormTextField {...props}>
      <InputGroup slot='input'>
        <Input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          inset
        />
      </InputGroup>
    </BaseFormTextField>
  )
}
