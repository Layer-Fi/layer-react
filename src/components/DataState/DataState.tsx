import React from 'react'
import AlertOctagon from '../../icons/AlertOctagon'
import CheckCircle from '../../icons/CheckCircle'
import Loader from '../../icons/Loader'
import RefreshCcw from '../../icons/RefreshCcw'
import { Button, ButtonVariant } from '../Button'
import { Text, TextSize, TextWeight } from '../Typography'

export enum DataStateStatus {
  allDone = 'allDone',
  failed = 'failed',
}

export interface DataStateProps {
  status: DataStateStatus
  title?: string
  description?: string
  onRefresh?: () => void
  isLoading?: boolean
}

const getIcon = (status: DataStateStatus) => {
  switch (status) {
    case DataStateStatus.failed:
      return (
        <span className='Layer__data-state__icon Layer__data-state__icon--error'>
          <AlertOctagon size={12} />
        </span>
      )
    default:
      return (
        <span className='Layer__data-state__icon Layer__data-state__icon--neutral'>
          <CheckCircle size={12} />
        </span>
      )
  }
}

export const DataState = ({
  status,
  title,
  description,
  onRefresh,
  isLoading,
}: DataStateProps) => {
  return (
    <div className='Layer__data-state'>
      {getIcon(status)}
      <Text
        as='span'
        size={TextSize.lg}
        weight={TextWeight.bold}
        className='Layer__data-state__title'
      >
        {title}
      </Text>
      <Text as='span' className='Layer__data-state__description'>
        {description}
      </Text>
      {onRefresh && (
        <span className='Layer__data-state__btn'>
          <Button
            variant={ButtonVariant.secondary}
            rightIcon={
              isLoading ? (
                <Loader size={14} className='Layer__anim--rotating' />
              ) : (
                <RefreshCcw size={12} />
              )
            }
            onClick={onRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </span>
      )}
    </div>
  )
}
