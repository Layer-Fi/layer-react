import { type ChangeEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '@components/Tooltip/Tooltip'

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
  badge?: ReactNode
}

export const Tab = ({
  checked,
  label,
  name,
  onChange,
  value,
  leftIcon,
  disabled,
  disabledMessage,
  index,
  badge,
}: TabProps) => {
  const { t } = useTranslation()
  const disabledMessageText = disabledMessage ?? t('common:state.disabled', 'Disabled')

  if (disabled) {
    return (
      <DeprecatedTooltip>
        <DeprecatedTooltipTrigger>
          <label className='Layer__tabs-option' data-checked={checked}>
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
              {badge}
            </span>
          </label>
        </DeprecatedTooltipTrigger>
        <DeprecatedTooltipContent className='Layer__tooltip'>
          {disabledMessageText}
        </DeprecatedTooltipContent>
      </DeprecatedTooltip>
    )
  }

  return (
    <label className='Layer__tabs-option' data-checked={checked}>
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
        {badge}
      </span>
    </label>
  )
}
