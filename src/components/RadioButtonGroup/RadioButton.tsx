import React from 'react'

type Props = {
  checked: boolean
  label: string
  name: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  value: string
}

export const RadioButton = ({
  checked,
  label,
  name,
  onChange,
  value,
}: Props) => {
  return (
    <label>
      <input
        type="radio"
        checked={checked}
        name={name}
        onChange={onChange}
        value={value}
      />
      <div>{label}</div>
    </label>
  )
}
