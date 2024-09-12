import React from 'react'
import CheckIcon from '../../icons/Check'
import ChevronRight from '../../icons/ChevronRight'
import { Text } from '../Typography'
import classNames from 'classnames'

export interface ActionableListOption<T> {
  label: string
  id: string
  value: T
  asLink?: boolean
  secondary?: boolean
}

interface ActionableListProps<T> {
  options: ActionableListOption<T>[]
  onClick: (item: ActionableListOption<T>) => void
  selectedId?: string
}

export const ActionableList = <T,>({
  options,
  onClick,
  selectedId,
}: ActionableListProps<T>) => {
  return (
    <ul className='Layer__actionable-list'>
      {options.map((x, idx) => (
        <li
          role='button'
          onClick={() => onClick(x)}
          key={`actionable-list-item-${idx}`}
          className={classNames(
            x.secondary && 'Layer__actionable-list-item--secondary',
            x.asLink && 'Layer__actionable-list-item--as-link',
          )}
        >
          <Text>{x.label}</Text>
          {!x.asLink && selectedId && selectedId === x.id ? (
            <span className='Layer__actionable-list__select Layer__actionable-list__select--selected'>
              <CheckIcon
                size={14}
                className='Layer__actionable-list__selected-icon'
              />
            </span>
          ) : null}
          {!x.asLink && (!selectedId || selectedId !== x.id) ? (
            <span className='Layer__actionable-list__select' />
          ) : null}
          {x.asLink && (
            <ChevronRight
              size={16}
              className='Layer__actionable-list__link-icon'
            />
          )}
        </li>
      ))}
    </ul>
  )
}
