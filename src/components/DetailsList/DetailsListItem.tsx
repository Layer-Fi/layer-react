import { Text, TextSize, TextWeight } from '../Typography/Text'
import { ReactNode } from 'react'
import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader'

export interface DetailsListItemProps {
  label: string
  children: ReactNode | string
  isLoading?: boolean
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

export const DetailsListItem = ({
  label,
  children,
  isLoading,
}: DetailsListItemProps) => {
  return (
    <li className='Layer__details-list-item'>
      <label className='Layer__details-list-item__label'>{label}</label>
      <div className='Layer__details-list-item__value'>
        {isLoading ? <SkeletonLoader /> : renderValue(children)}
      </div>
    </li>
  )
}
