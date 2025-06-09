import { ReactNode } from 'react'
import AlertOctagon from '../../icons/AlertOctagon'
import CheckCircle from '../../icons/CheckCircle'
import Loader from '../../icons/Loader'
import RefreshCcw from '../../icons/RefreshCcw'
import { Button, ButtonVariant } from '../Button'
import { Text, TextSize, TextWeight } from '../Typography'
import classNames from 'classnames'

export enum DataStateStatus {
  allDone = 'allDone',
  success = 'success',
  failed = 'failed',
  info = 'info',
}

export interface DataStateProps {
  status: DataStateStatus
  title?: string
  icon?: ReactNode
  description?: string
  onRefresh?: () => void
  isLoading?: boolean
  spacing?: boolean
  inline?: boolean
  className?: string
}

const getIcon = (status: DataStateStatus, icon?: ReactNode) => {
  switch (status) {
    case DataStateStatus.failed:
      return (
        <span className='Layer__data-state__icon Layer__data-state__icon--error'>
          {icon ?? <AlertOctagon size={12} />}
        </span>
      )
    case DataStateStatus.info:
      return (
        <span className='Layer__data-state__icon Layer__data-state__icon--neutral'>
          {icon ?? <AlertOctagon size={12} />}
        </span>
      )
    case DataStateStatus.success:
      return (
        <span className='Layer__data-state__icon Layer__data-state__icon--success'>
          {icon ?? <CheckCircle size={12} />}
        </span>
      )
    default:
      return (
        <span className='Layer__data-state__icon Layer__data-state__icon--neutral'>
          {icon ?? <CheckCircle size={12} />}
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
  icon,
  spacing,
  inline,
  className,
}: DataStateProps) => {
  const baseClassName = classNames(
    'Layer__data-state', {
      'Layer__data-state--spacing': spacing,
      'Layer__data-state--inline': inline,
    },
    className,
  )

  return (
    <div className={baseClassName}>
      {getIcon(status, icon)}
      <div>
        <Text
          as='span'
          size={inline ? TextSize.sm : TextSize.lg}
          weight={TextWeight.bold}
          className='Layer__data-state__title'
        >
          {title}
        </Text>
        <Text as='span' size={inline ? TextSize.sm : TextSize.md} className='Layer__data-state__description'>
          {description}
        </Text>
      </div>
      {onRefresh && (
        <span className='Layer__data-state__btn'>
          <Button
            variant={ButtonVariant.secondary}
            rightIcon={
              isLoading
                ? (
                  <Loader size={14} className='Layer__anim--rotating' />
                )
                : (
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
