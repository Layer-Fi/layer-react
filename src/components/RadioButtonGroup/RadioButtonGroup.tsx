import React, { useState } from 'react'
import { RadioButton } from './RadioButton'

export type RadioButtonLabel = {
  label: string
  value: string
  disabled?: boolean
}

type Props = {
  name: string
  size?: 'small' | 'large'
  buttons: RadioButtonLabel[]
  selected?: RadioButtonLabel['value']
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const RadioButtonGroup = ({
  name,
  size,
  buttons,
  onChange,
  selected,
}: Props) => {
  const selectedValue = selected || buttons[0].value
  return (
    <div className="radio-button-group">
      {buttons.map(button => (
        <RadioButton
          {...button}
          key={button.value}
          name={name}
          size={size}
          checked={selectedValue === button.value}
          onChange={onChange}
          disabled={button.disabled ?? false}
        />
      ))}
    </div>
  )
}
