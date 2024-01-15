import React from 'react'

type Props = {
  checked: boolean
  label: string
  name: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  value: string
  disabled?: boolean
  size: 'small' | 'large'
}

export const RadioButton = ({
  checked,
  label,
  name,
  onChange,
  value,
  disabled,
  size,
}: Props) => {
  return (
    <label
      className={`Layer__radio-button-group__radio-button Layer__radio-button-group__radio-button--size-${size}`}
    >
      <input
        type='radio'
        checked={checked}
        name={name}
        onChange={onChange}
        value={value}
        disabled={disabled ?? false}
      />
      <div>{label}</div>
    </label>
  )
}
