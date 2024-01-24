import React, { ChangeEvent } from 'react'
import classNames from 'classnames'

export interface Option {
  label: string
  value: string
  disabled?: boolean
}

export enum ToggleSize {
  medium = 'medium',
  small = 'small',
}

export interface ToggleProps {
  name: string
  size?: ToggleSize
  options: Option[]
  selected?: Option['value']
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

interface ToggleOptionProps {
  checked: boolean
  label: string
  name: string
  size: ToggleSize
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  value: string
  disabled?: boolean
}

export const Toggle = ({
  name,
  options,
  selected,
  onChange,
  size = ToggleSize.medium,
}: ToggleProps) => {
  const selectedValue = selected || options[0].value
  const baseClassName = classNames('Layer__toggle', `Layer__toggle--${size}`)

  return (
    <div className={baseClassName}>
      {options.map(option => (
        <ToggleOption
          {...option}
          size={size}
          key={option.value}
          name={name}
          checked={selectedValue === option.value}
          onChange={onChange}
          disabled={option.disabled ?? false}
        />
      ))}
    </div>
  )
}

const ToggleOption = ({
  checked,
  label,
  name,
  onChange,
  value,
  size,
  disabled,
}: ToggleOptionProps) => {
  return (
    <label className={`Layer__toggle-option`}>
      <input
        type='radio'
        checked={checked}
        name={name}
        onChange={onChange}
        value={value}
        disabled={disabled ?? false}
      />
      <span>{label}</span>
    </label>
  )
}
