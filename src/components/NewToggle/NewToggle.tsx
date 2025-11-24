import type { Key, Selection } from 'react-aria-components'
import { ToggleButtonGroup } from 'react-aria-components'

import './NewToggle.scss'

import { NewToggleOption } from './NewToggleOption'
import { type NewToggleOptionProps } from './NewToggleOption'

export interface NewToggleProps {
  options: NewToggleOptionProps[]
  selectedKey?: Key
  onSelectionChange?: (key: Key) => void
}

export const NewToggle = ({
  options,
  selectedKey,
  onSelectionChange,
}: NewToggleProps) => {
  const selectedKeys: Selection =
    selectedKey !== undefined ? new Set([selectedKey]) : new Set()

  return (
    <ToggleButtonGroup
      className='Layer__NewToggle'
      selectionMode='single'
      selectedKeys={selectedKeys}
      onSelectionChange={(keys) => {
        const selectedKeysArray = Array.from(keys)
        if (selectedKeysArray.length > 0 && onSelectionChange) {
          onSelectionChange(selectedKeysArray[0])
        }
      }}
    >
      {options.map(option => (
        <NewToggleOption key={option.value} {...option} />
      ))}
    </ToggleButtonGroup>
  )
}
