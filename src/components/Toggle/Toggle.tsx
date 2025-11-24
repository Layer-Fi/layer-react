import type { CSSProperties, ReactNode } from 'react'
import type { Key, Selection } from 'react-aria-components'
import {
  ToggleButton as ReactAriaToggleButton,
  ToggleButtonGroup as ReactAriaToggleButtonGroup,
} from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { Span } from '@ui/Typography/Text'
import {
  DeprecatedTooltip,
  DeprecatedTooltipContent,
  DeprecatedTooltipTrigger,
} from '@components/Tooltip/Tooltip'

export interface Option {
  label: string
  value: string
  disabled?: boolean
  disabledMessage?: string
  leftIcon?: ReactNode
  style?: CSSProperties
}

export enum ToggleSize {
  medium = 'medium',
  small = 'small',
  xsmall = 'xsmall',
}

export interface ToggleProps {
  size?: ToggleSize
  options: Option[]
  selectedKey?: Key
  defaultSelectedKey?: Key
  onSelectionChange?: (key: Key) => void
}

interface ToggleOptionProps extends Option {
  size: ToggleSize
}

export const Toggle = ({
  options,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  size = ToggleSize.medium,
}: ToggleProps) => {
  const dataProperties = toDataProperties({ size })

  const selectedKeys: Selection =
    selectedKey !== undefined ? new Set([selectedKey]) : new Set()
  const defaultSelectedKeys: Selection =
    defaultSelectedKey !== undefined
      ? new Set([defaultSelectedKey])
      : new Set()

  return (
    <ReactAriaToggleButtonGroup
      className='Layer__toggle'
      {...dataProperties}
      selectionMode='single'
      selectedKeys={selectedKey !== undefined ? selectedKeys : undefined}
      defaultSelectedKeys={
        defaultSelectedKey !== undefined ? defaultSelectedKeys : undefined
      }
      onSelectionChange={(keys) => {
        const selectedKeysArray = Array.from(keys)
        if (selectedKeysArray.length > 0 && onSelectionChange) {
          onSelectionChange(selectedKeysArray[0])
        }
      }}
    >
      {options.map(option => (
        <ToggleOption key={option.value} {...option} size={size} />
      ))}
    </ReactAriaToggleButtonGroup>
  )
}

const ToggleOption = ({
  label,
  value,
  size: _size,
  leftIcon,
  disabled,
  disabledMessage = 'Disabled',
  style,
}: ToggleOptionProps) => {
  if (disabled) {
    return (
      <DeprecatedTooltip>
        <DeprecatedTooltipTrigger>
          <ReactAriaToggleButton
            id={value}
            isDisabled={disabled}
            style={style}
          >
            <span className='Layer__toggle-option-content'>
              {leftIcon && (
                <span className='Layer__toggle-option__icon'>{leftIcon}</span>
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
      <span className='Layer__toggle-option-content'>
        {leftIcon && (
          <span className='Layer__toggle-option__icon'>{leftIcon}</span>
        )}
        <Span noWrap>{label}</Span>
      </span>
    </ReactAriaToggleButton>
  )
}
