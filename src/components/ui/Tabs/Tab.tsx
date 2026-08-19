import { type ChangeEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip/Tooltip'

const legacyClassNames = createLegacyClassNames({
  Layer__UI__Tabs__Option: 'Layer__tabs-option',
  Layer__UI__Tabs__OptionContent: 'Layer__tabs-option-content',
  Layer__UI__Tabs__OptionIcon: 'Layer__tabs-option__icon',
})

export const TABS_OPTION_CLASS_NAME = 'Layer__UI__Tabs__Option'

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
      <Tooltip>
        <TooltipTrigger>
          <label className={legacyClassNames('Layer__UI__Tabs__Option')} data-checked={checked}>
            <input
              type='radio'
              checked={checked}
              name={name}
              onChange={onChange}
              value={value}
              disabled={disabled ?? false}
              data-idx={index}
            />
            <span className={legacyClassNames('Layer__UI__Tabs__OptionContent')}>
              {leftIcon && (
                <span className={legacyClassNames('Layer__UI__Tabs__OptionIcon')}>{leftIcon}</span>
              )}
              <span>{label}</span>
              {badge}
            </span>
          </label>
        </TooltipTrigger>
        <TooltipContent>
          {disabledMessageText}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <label className={legacyClassNames('Layer__UI__Tabs__Option')} data-checked={checked}>
      <input
        type='radio'
        checked={checked}
        name={name}
        onChange={onChange}
        value={value}
        disabled={disabled ?? false}
        data-idx={index}
      />
      <span className={legacyClassNames('Layer__UI__Tabs__OptionContent')}>
        {leftIcon && (
          <span className={legacyClassNames('Layer__UI__Tabs__OptionIcon')}>{leftIcon}</span>
        )}
        <span>{label}</span>
        {badge}
      </span>
    </label>
  )
}
