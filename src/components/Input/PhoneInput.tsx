import { ChangeEvent } from 'react'
import { Input, InputProps } from './Input'

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
  const formatPhoneNumber = (input: string): string => {
    const cleaned = input.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)

    if (!match) return ''

    const parts = [match[1], match[2], match[3]].filter(Boolean)

    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]
    if (parts.length === 2) return `${parts[0]}-${parts[1]}`
    return `${parts[0]}-${parts[1]}-${parts[2]}`
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formattedNumber = formatPhoneNumber(input)
    onChange(formattedNumber)
  }

  return (
    <Input
      type='tel'
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      maxLength={12}
      pattern='[0-9]{3}-[0-9]{3}-[0-9]{4}'
      aria-label='Phone number input'
      {...props}
    />
  )
}
