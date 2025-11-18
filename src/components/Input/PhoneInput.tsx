import { type ChangeEvent } from 'react'
import { formatIncompletePhoneNumber } from 'libphonenumber-js'

import { Input, type InputProps } from '@components/Input/Input'

interface PhoneInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value?: string
  onChange: (value?: string) => void
}

export const PhoneInput = ({
  value,
  onChange,
  placeholder = 'Phone number',
  ...props
}: PhoneInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formattedNumber = formatIncompletePhoneNumber(input, 'US')
    onChange(formattedNumber ?? input)
  }

  return (
    <Input
      type='tel'
      value={value ? formatIncompletePhoneNumber(value, 'US') : undefined}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label='Phone number input'
      {...props}
    />
  )
}
