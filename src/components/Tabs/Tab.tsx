import React, { ChangeEvent, ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip'

interface TabProps {
  checked: boolean
  label: string
  name: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  value: string
  disabled?: boolean
  disabledMessage?: string
  leftIcon?: ReactNode
  index: number
}

export const Tab = ({
  checked,
  label,
  name,
  onChange,
  value,
  leftIcon,
  disabled,
  disabledMessage = 'Disabled',
  index,
}: TabProps) => {
  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <label className={'Layer__tabs-option'} data-checked={checked}>
            <input
              type='radio'
              checked={checked}
              name={name}
              onChange={onChange}
              value={value}
              disabled={disabled ?? false}
              data-idx={index}
            />
            <span className='Layer__tabs-option-content'>
              {leftIcon && (
                <span className='Layer__tabs-option__icon'>{leftIcon}</span>
              )}
              <span>{label}</span>
            </span>
          </label>
        </TooltipTrigger>
        <TooltipContent className='Layer__tooltip'>
          {disabledMessage}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <label className={'Layer__tabs-option'} data-checked={checked}>
      <input
        type='radio'
        checked={checked}
        name={name}
        onChange={onChange}
        value={value}
        disabled={disabled ?? false}
        data-idx={index}
      />
      <span className='Layer__tabs-option-content'>
        {leftIcon && (
          <span className='Layer__tabs-option__icon'>{leftIcon}</span>
        )}
        <span>{label}</span>
      </span>
    </label>
  )
}
