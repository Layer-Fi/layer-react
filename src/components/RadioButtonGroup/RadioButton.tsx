import React from 'react'

type Props = {
  checked: boolean
  label: string
  name: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  value: string
  disabled?: boolean
}

export const RadioButton = ({
  checked,
  label,
  name,
  onChange,
  value,
  disabled,
}: Props) => {
  return (
    <label className="radio-button-group__radio-button">
      <input
        type="radio"
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
