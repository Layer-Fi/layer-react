import React, { ReactNode } from 'react'
import { Text, TextSize, TextWeight } from '../Typography'

export interface DetailsListItemProps {
  label: string
  children: ReactNode | string
}

const renderValue = (value: ReactNode | string) => {
  if (typeof value === 'string') {
    return (
      <Text weight={TextWeight.bold} size={TextSize.sm}>
        {value}
      </Text>
    )
  }

  return value
}

export const DetailsListItem = ({ label, children }: DetailsListItemProps) => {
  return (
    <li className='Layer__details-list-item'>
      <label className='Layer__details-list-item__label'>{label}</label>
      <span className='Layer__details-list-item__value'>
        {renderValue(children)}
      </span>
    </li>
  )
}
