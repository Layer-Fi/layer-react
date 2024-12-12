import React from 'react'
import CheckIcon from '../../icons/Check'
import ChevronRight from '../../icons/ChevronRight'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'

export interface ActionableListOption<T> {
  label: string
  id: string
  description?: string
  value: T
  asLink?: boolean
  secondary?: boolean
}

interface ActionableListProps<T> {
  options: ActionableListOption<T>[]
  onClick: (item: ActionableListOption<T>) => void
  selectedId?: string
  showDescriptions?: boolean
}

export const ActionableList = <T,>({
  options,
  onClick,
  selectedId,
  showDescriptions = false,
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
            selectedId === x.id && 'Layer__actionable-list__item--selected',
          )}
        >
          <div className='Layer__actionable-list__content'>
            <Text size={TextSize.sm}>{x.label}</Text>
            {
              /* TODO: Replace 'See all categories' with something more generic */
              showDescriptions
              && x.description
              && x.label !== 'See all categories' && (
                <Text
                  className='Layer__actionable-list__content-description'
                  size={TextSize.sm}
                >
                  {x.description}
                </Text>
              )
            }
          </div>
          {!x.asLink && selectedId && selectedId === x.id
            ? (
              <span className='Layer__actionable-list__select Layer__actionable-list__select--selected'>
                <CheckIcon
                  size={14}
                  className='Layer__actionable-list__selected-icon'
                />
              </span>
            )
            : null}
          {!x.asLink && (!selectedId || selectedId !== x.id)
            ? (
              <span className='Layer__actionable-list__select' />
            )
            : null}
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
