import type { Key, Selection } from 'react-aria-components'
import { ToggleButtonGroup as ReactAriaToggleButtonGroup } from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'

import './NewToggle.scss'

import { NewToggleOption } from './NewToggleOption'
import { type NewToggleOptionData } from './NewToggleOption'

export enum NewToggleSize {
  medium = 'medium',
  small = 'small',
  xsmall = 'xsmall',
}

export interface NewToggleProps {
  size?: NewToggleSize
  options: NewToggleOptionData[]
  selectedKey?: Key
  defaultSelectedKey?: Key
  onSelectionChange?: (key: Key) => void
}

export const NewToggle = ({
  options,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  size = NewToggleSize.medium,
}: NewToggleProps) => {
  const dataProperties = toDataProperties({ size })

  const selectedKeys: Selection =
    selectedKey !== undefined ? new Set([selectedKey]) : new Set()
  const defaultSelectedKeys: Selection =
    defaultSelectedKey !== undefined
      ? new Set([defaultSelectedKey])
      : new Set()

  return (
    <ReactAriaToggleButtonGroup
      className='Layer__NewToggle'
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
        <NewToggleOption key={option.value} {...option} size={size} />
      ))}
    </ReactAriaToggleButtonGroup>
  )
}
