import { useCallback } from 'react'
import { TextArea } from '../../../components/ui/Input/TextArea'
import { useFieldContext } from '../hooks/useForm'
import { BaseFormTextField, type BaseFormTextFieldProps } from './BaseFormTextField'

type FormTextAreaFieldProps = {
  slotProps: {
    BaseFormTextField: BaseFormTextFieldProps
  }
}

export function FormTextAreaField({ slotProps }: FormTextAreaFieldProps) {
  const field = useFieldContext<string>()

  const { name, state, handleChange, handleBlur } = field
  const { value } = state

  const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e.target.value)
  }, [handleChange])

  return (
    <BaseFormTextField {...slotProps.BaseFormTextField}>
      <TextArea id={name} name={name} value={value} onChange={onChange} onBlur={handleBlur} />
    </BaseFormTextField>
  )
}
