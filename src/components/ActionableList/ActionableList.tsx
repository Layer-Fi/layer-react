import React from 'react'
import CheckIcon from '../../icons/Check'
import { Text } from '../Typography'

export interface ActionableListOption<T> {
  label: string
  id: string
  value: T
}

interface ActionableListProps<T> {
  options: ActionableListOption<T>[]
  onClick: (item: ActionableListOption<T>) => void
  selected?: ActionableListOption<T>
}

export const ActionableList = <T,>({
  options,
  onClick,
  selected,
}: ActionableListProps<T>) => {
  return (
    <ul className='Layer__actionable-list'>
      {options.map((x, idx) => (
        <li
          role='button'
          onClick={() => onClick(x)}
          key={`actionable-list-item-${idx}`}
        >
          <Text>{x.label}</Text>
          {selected && selected.id === x.id ? (
            <CheckIcon
              size={16}
              className='Layer__actionable-list__selected-icon'
            />
          ) : null}
        </li>
      ))}
    </ul>
  )
}
