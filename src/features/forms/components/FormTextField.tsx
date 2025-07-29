import { useCallback } from 'react'
import { Input } from '../../../components/ui/Input/Input'
import { useFieldContext } from '../hooks/useForm'
import { InputGroup } from '../../../components/ui/Input/InputGroup'
import { BaseFormTextField, type BaseFormTextFieldProps } from './BaseFormTextField'

type FormTextFieldProps = BaseFormTextFieldProps
export function FormTextField(props: FormTextFieldProps) {
  const field = useFieldContext<string>()

  const { name, state, handleChange, handleBlur } = field
  const { value } = state

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e.target.value)
  }, [handleChange])

  return (
    <BaseFormTextField {...props}>
      <InputGroup>
        <Input inset id={name} name={name} value={value} onChange={onChange} onBlur={handleBlur} />
      </InputGroup>
    </BaseFormTextField>
  )
}
