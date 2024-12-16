import React, { HTMLProps } from 'react'
import { Input } from './Input'

export interface AmountInputProps extends Omit<HTMLProps<HTMLInputElement>, 'onChange'> {
  isInvalid?: boolean
  errorMessage?: string
  leftText?: string
  onChange?: (value?: string) => void
}

/** @TODO this component is oversimplified.
 * Need to have better number conversion and decorations
 */
export const AmountInput = ({
  onChange,
  ...props
}: AmountInputProps) => {
  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    try {
      onChange && onChange((e.target as HTMLInputElement).value.replace(/[^\d.]/g, ''))
    } catch {
      return
    }
  }

  return (
    <Input onChange={onInputChange} {...props} />
  )
}
