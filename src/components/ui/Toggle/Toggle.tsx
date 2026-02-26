import type { Key, Selection } from 'react-aria-components'
import { ToggleButtonGroup } from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'

import './toggle.scss'

import { ToggleOption } from './ToggleOption'
import { type ToggleOptionProps } from './ToggleOption'

export enum ToggleSize {
  medium = 'medium',
  small = 'small',
  xsmall = 'xsmall',
}

export interface ToggleProps {
  ariaLabel: string
  options: ToggleOptionProps[]
  selectedKey?: Key
  onSelectionChange?: (key: Key) => void
  fullWidth?: boolean
  size?: ToggleSize
}

export const Toggle = ({
  ariaLabel,
  options,
  selectedKey,
  onSelectionChange,
  fullWidth = false,
  size = ToggleSize.medium,
}: ToggleProps) => {
  const selectedKeys: Selection =
    selectedKey !== undefined ? new Set([selectedKey]) : new Set()

  const dataProperties = toDataProperties({
    'full-width': fullWidth,
    'size': size,
  })

  return (
    <ToggleButtonGroup
      aria-label={ariaLabel}
      className='Layer__UI__Toggle'
      {...dataProperties}
      selectionMode='single'
      selectedKeys={selectedKeys}
      onSelectionChange={(keys) => {
        const selectedKeysArray = Array.from(keys)
        const firstKey = selectedKeysArray[0]
        if (firstKey !== undefined && onSelectionChange) {
          onSelectionChange(firstKey)
        }
      }}
    >
      {options.map(option => (
        <ToggleOption key={option.value} {...option} />
      ))}
    </ToggleButtonGroup>
  )
}
