import type { CSSProperties, ReactNode } from 'react'
import { SelectionIndicator, ToggleButton } from 'react-aria-components'

import { Span } from '@ui/Typography/Text'
import {
  DeprecatedTooltip,
  DeprecatedTooltipContent,
  DeprecatedTooltipTrigger,
} from '@components/Tooltip/Tooltip'

import './NewToggleOption.scss'

import { type NewToggleSize } from './NewToggle'

interface NewToggleOptionProps extends NewToggleOptionData {
  size: NewToggleSize
}

export interface NewToggleOptionData {
  label: string
  value: string
  disabled?: boolean
  disabledMessage?: string
  leftIcon?: ReactNode
  style?: CSSProperties
}

export const NewToggleOption = ({
  label,
  value,
  size: _size,
  leftIcon,
  disabled,
  disabledMessage = 'Disabled',
  style,
}: NewToggleOptionProps) => {
  if (disabled) {
    return (
      <DeprecatedTooltip>
        <DeprecatedTooltipTrigger>
          <ToggleButton
            id={value}
            isDisabled={disabled}
            style={style}
            className='Layer__NewToggleOption'
          >
            <SelectionIndicator className='Layer__NewToggleOption-SelectionIndicator' />
            <Span className='Layer__NewToggle-Option-Content'>
              {leftIcon && (
                <span className='Layer__NewToggle-Option__Icon'>{leftIcon}</span>
              )}
              <Span noWrap>{label}</Span>
            </Span>
          </ToggleButton>
        </DeprecatedTooltipTrigger>
        <DeprecatedTooltipContent className='Layer__tooltip'>
          {disabledMessage}
        </DeprecatedTooltipContent>
      </DeprecatedTooltip>
    )
  }

  return (
    <ToggleButton id={value} isDisabled={disabled} style={style} className='Layer__NewToggleOption'>
      <SelectionIndicator className='Layer__NewToggleOption-SelectionIndicator' />
      <Span className='Layer__NewToggle-Option-Content'>
        {leftIcon && (
          <span className='Layer__NewToggle-Option__Icon'>{leftIcon}</span>
        )}
        <Span noWrap>{label}</Span>
      </Span>
    </ToggleButton>
  )
}
