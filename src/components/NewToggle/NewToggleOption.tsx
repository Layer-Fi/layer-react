import type { CSSProperties, ReactNode } from 'react'
import { ToggleButton as ReactAriaToggleButton } from 'react-aria-components'

import { Span } from '@ui/Typography/Text'
import {
  DeprecatedTooltip,
  DeprecatedTooltipContent,
  DeprecatedTooltipTrigger,
} from '@components/Tooltip/Tooltip'

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
          <ReactAriaToggleButton
            id={value}
            isDisabled={disabled}
            style={style}
          >
            <span className='Layer__NewToggle-Option-Content'>
              {leftIcon && (
                <span className='Layer__NewToggle-Option__Icon'>{leftIcon}</span>
              )}
              <Span noWrap>{label}</Span>
            </span>
          </ReactAriaToggleButton>
        </DeprecatedTooltipTrigger>
        <DeprecatedTooltipContent className='Layer__tooltip'>
          {disabledMessage}
        </DeprecatedTooltipContent>
      </DeprecatedTooltip>
    )
  }

  return (
    <ReactAriaToggleButton id={value} isDisabled={disabled} style={style}>
      <span className='Layer__NewToggle-Option-Content'>
        {leftIcon && (
          <span className='Layer__NewToggle-Option__Icon'>{leftIcon}</span>
        )}
        <Span noWrap>{label}</Span>
      </span>
    </ReactAriaToggleButton>
  )
}
