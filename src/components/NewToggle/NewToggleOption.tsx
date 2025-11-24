import type { CSSProperties } from 'react'
import { SelectionIndicator, ToggleButton } from 'react-aria-components'

import { Span } from '@ui/Typography/Text'
import {
  DeprecatedTooltip,
  DeprecatedTooltipContent,
  DeprecatedTooltipTrigger,
} from '@components/Tooltip/Tooltip'

import './newToggleOption.scss'
export interface NewToggleOptionProps {
  label: string
  value: string
  disabled?: boolean
  disabledMessage?: string
  style?: CSSProperties
}

export const NewToggleOption = ({
  label,
  value,
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
        <Span noWrap>{label}</Span>
      </Span>
    </ToggleButton>
  )
}
