import React, { useState } from 'react'
import { RadioButton } from './RadioButton'

export type RadioButtonLabel = {
  label: string
  value: string
}

type Props = {
  name: string
  buttons: RadioButtonLabel[]
  selected?: Pick<RadioButtonLabel, 'value'>
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const RadioButtonGroup = ({
  name,
  buttons,
  onChange,
  selected,
}: Props) => {
  const selectedValue = selected || buttons[0].value
  return (
    <div className="radio-group">
      {buttons.map(button => (
        <RadioButton
          {...button}
          key={button.value}
          name={name}
          checked={selectedValue === button.value}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
