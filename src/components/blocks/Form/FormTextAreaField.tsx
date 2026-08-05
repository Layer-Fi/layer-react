import { useCallback } from 'react'

import { TextArea } from '@ui/Input/TextArea'
import { BaseFormTextField, type BaseFormTextFieldProps } from '@blocks/Form/BaseFormTextField'

import { useFieldContext } from './formContexts'

export type FormTextAreaFieldProps = Omit<BaseFormTextFieldProps, 'isTextArea'> & {
  placeholder?: string
}
export function FormTextAreaField({ placeholder, ...props }: FormTextAreaFieldProps) {
  const field = useFieldContext<string>()

  const { name, state, handleChange, handleBlur } = field
  const { value } = state

  const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e.target.value)
  }, [handleChange])

  return (
    <BaseFormTextField {...props} isTextArea>
      <TextArea
        slot='input'
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
    </BaseFormTextField>
  )
}
