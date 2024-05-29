import React from 'react'

export interface ActionableListOption<T> {
  label: string
  value: T
}

interface ActionableListProps<T> {
  options: ActionableListOption<T>[]
  onClick: (item: ActionableListOption<T>) => void
}

export const ActionableList = <T,>({
  options,
  onClick,
}: ActionableListProps<T>) => {
  return (
    <ul className='Layer__actionable-list'>
      {options.map((x, idx) => (
        <li
          role='button'
          onClick={() => onClick(x)}
          key={`actionable-list-item-${idx}`}
        >
          {x.label}
        </li>
      ))}
    </ul>
  )
}
