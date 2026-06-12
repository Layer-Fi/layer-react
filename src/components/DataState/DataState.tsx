import { type ReactNode } from 'react'
import classNames from 'classnames'
import { CircleCheckBig, Loader, OctagonAlert, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { Span } from '@ui/Typography/Text'
import { Button, ButtonVariant } from '@components/Button/Button'

import './dataState.scss'

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
  titleSize?: 'sm' | 'md' | 'lg'
  className?: string
}

const getIcon = (status: DataStateStatus, icon?: ReactNode) => {
  switch (status) {
    case DataStateStatus.failed:
      return (
        <span className='Layer__data-state__icon Layer__data-state__icon--error'>
          {icon ?? <OctagonAlert size={12} />}
        </span>
      )
    case DataStateStatus.info:
      return (
        <span className='Layer__data-state__icon Layer__data-state__icon--neutral'>
          {icon ?? <OctagonAlert size={12} />}
        </span>
      )
    case DataStateStatus.success:
      return (
        <span className='Layer__data-state__icon Layer__data-state__icon--success'>
          {icon ?? <CircleCheckBig size={12} />}
        </span>
      )
    case DataStateStatus.allDone:
      return (
        <span className='Layer__data-state__icon Layer__data-state__icon--neutral'>
          {icon ?? <CircleCheckBig size={12} />}
        </span>
      )
    default:
      unsafeAssertUnreachable({
        value: status,
        message: 'Unexpected DataStateStatus in DataState',
      })
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
  titleSize = inline ? 'sm' : 'lg',
  className,
}: DataStateProps) => {
  const { t } = useTranslation()
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
      <div className='Layer__data-state__text'>
        <Span
          size={titleSize}
          weight='bold'
          variant='placeholder'
          align={inline ? undefined : 'center'}
        >
          {title}
        </Span>
        <Span
          size={inline ? 'sm' : 'md'}
          status='disabled'
          align={inline ? undefined : 'center'}
        >
          {description}
        </Span>
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
            {t('common:action.refresh_label', 'Refresh')}
          </Button>
        </span>
      )}
    </div>
  )
}
