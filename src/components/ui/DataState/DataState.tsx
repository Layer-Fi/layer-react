import { type ReactNode } from 'react'
import classNames from 'classnames'
import { CircleCheckBig, OctagonAlert, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { unsafeAssertUnreachable } from '@utils/shared/switch/assertUnreachable'
import { Button } from '@ui/Button/Button'
import { Span } from '@ui/Typography/Text'

import './dataState.scss'

const legacyClassNames = createLegacyClassNames({
  'state:title': 'Layer__data-state__title',
  'state:description': 'Layer__data-state__description',
})

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
  slotProps?: {
    Title?: {
      size?: 'sm' | 'md' | 'lg'
      ellipsis?: boolean
    }
  }
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
  slotProps,
  className,
}: DataStateProps) => {
  const { t } = useTranslation()
  const { size: titleSize = inline ? 'sm' : 'lg', ellipsis: titleEllipsis } = slotProps?.Title ?? {}
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
          className={legacyClassNames('state:title')}
          size={titleSize}
          weight='bold'
          variant='placeholder'
          align={inline ? undefined : 'center'}
          withTooltip={titleEllipsis}
        >
          {title}
        </Span>
        <Span
          className={legacyClassNames('state:description')}
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
            variant='outlined'
            onPress={onRefresh}
            isDisabled={isLoading}
            isPending={isLoading}
          >
            {t('common:action.refresh_label', 'Refresh')}
            <RefreshCcw size={12} />
          </Button>
        </span>
      )}
    </div>
  )
}
