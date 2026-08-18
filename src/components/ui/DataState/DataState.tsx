import { type ReactNode } from 'react'
import classNames from 'classnames'
import { CircleCheckBig, OctagonAlert, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { unsafeAssertUnreachable } from '@utils/shared/switch/assertUnreachable'
import { Button } from '@ui/Button/Button'
import { Span } from '@ui/Typography/Text'

import './dataState.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__UI__DataState': 'Layer__data-state',
  'Layer__UI__DataState__Icon': 'Layer__data-state__icon',
  'Layer__UI__DataState__Text': 'Layer__data-state__text',
  'Layer__UI__DataState__Button': 'Layer__data-state__btn',
  'state:title': 'Layer__data-state__title',
  'state:description': 'Layer__data-state__description',
  'data:spacing': 'Layer__data-state--spacing',
  'state:inline': 'Layer__data-state--inline',
  'state:reset': 'Layer__data-state--reset',
  'status:neutral': 'Layer__data-state__icon--neutral',
  'status:success': 'Layer__data-state__icon--success',
  'status:error': 'Layer__data-state__icon--error',
} satisfies LegacyClassNameMapFor<
  'Layer__UI__DataState' | 'Layer__UI__DataState__Icon' | 'Layer__UI__DataState__Text' | 'Layer__UI__DataState__Button',
  `state:${string}` | `status:${string}` | `data:${string}`
>)

type IconStatus = 'neutral' | 'success' | 'error'

const DataStateIcon = ({ status, children }: { status: IconStatus, children: ReactNode }) => (
  <span
    className={legacyClassNames('Layer__UI__DataState__Icon', `status:${status}`)}
    {...toDataProperties({ status })}
  >
    {children}
  </span>
)

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
  reset?: boolean
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
      return <DataStateIcon status='error'>{icon ?? <OctagonAlert size={12} />}</DataStateIcon>
    case DataStateStatus.info:
      return <DataStateIcon status='neutral'>{icon ?? <OctagonAlert size={12} />}</DataStateIcon>
    case DataStateStatus.success:
      return <DataStateIcon status='success'>{icon ?? <CircleCheckBig size={12} />}</DataStateIcon>
    case DataStateStatus.allDone:
      return <DataStateIcon status='neutral'>{icon ?? <CircleCheckBig size={12} />}</DataStateIcon>
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
  reset,
  slotProps,
  className,
}: DataStateProps) => {
  const { t } = useTranslation()
  const { size: titleSize = inline ? 'sm' : 'lg', ellipsis: titleEllipsis } = slotProps?.Title ?? {}
  const baseClassName = classNames(
    legacyClassNames(
      'Layer__UI__DataState',
      spacing && 'data:spacing',
      inline && 'state:inline',
      reset && 'state:reset',
    ),
    className,
  )

  return (
    <div className={baseClassName} {...toDataProperties({ spacing, inline, reset })}>
      {getIcon(status, icon)}
      <div className={legacyClassNames('Layer__UI__DataState__Text')}>
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
        <span className={legacyClassNames('Layer__UI__DataState__Button')}>
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
