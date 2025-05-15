import AlertCircle from '../../icons/AlertCircle'
import Clock from '../../icons/Clock'
import { Text, TextSize, TextWeight } from '../Typography/Text'
import CheckCircle from '../../icons/CheckCircle'
import { BookkeepingPeriod } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import pluralize from 'pluralize'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'
import { safeAssertUnreachable } from '../../utils/switch/assertUnreachable'
import { CustomerFacingBookkeepingPeriodStatus, getCustomerFacingBookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/utils'

type TaskStatusBadgeProps = {
  status: BookkeepingPeriod['status']
  tasksCount?: number
}

const buildBadgeConfig = (status: TaskStatusBadgeProps['status'], tasksCount: TaskStatusBadgeProps['tasksCount']) => {
    const hasOpenTasks = tasksCount !== undefined && tasksCount > 0
    const customerFacingStatus = getCustomerFacingBookkeepingPeriodStatus(status, hasOpenTasks)

  switch (customerFacingStatus) {
    case CustomerFacingBookkeepingPeriodStatus.BOOKS_IN_PROGRESS: {
      return {
        color: 'info' as const,
        icon: <Clock size={12} />,
      }
    }
    case CustomerFacingBookkeepingPeriodStatus.ACTION_REQUIRED: {
      return {
        color: 'warning' as const,
        icon: <AlertCircle size={12} />,
        label: tasksCount ? pluralize('task', tasksCount, true) : undefined,
        labelShort: tasksCount ? `${tasksCount}` : undefined,
      }
    }
    case CustomerFacingBookkeepingPeriodStatus.BOOKS_COMPLETED: {
      return {
        color: 'success' as const,
        icon: <CheckCircle size={12} />,
      }
    }
    default: {
      return undefined
    }
  }
}

export const TaskStatusBadge = ({ status, tasksCount }: TaskStatusBadgeProps) => {
  const badgeConfig = buildBadgeConfig(status, tasksCount)

  if (!badgeConfig) {
    return
  }

  const dataProperties = toDataProperties({ status: badgeConfig.color, icononly: !badgeConfig.label })

  return (
    <span className='Layer__tasks__badge' {...dataProperties}>
      <span className='Layer__tasks__badge__icon-wrapper' data-status={badgeConfig.color}>
        {badgeConfig.icon}
      </span>
      {
        /*
         * The labels are both rendered, BUT only one is visible at a time (controlled by container query)
         */
      }
      {badgeConfig.label && (
        <Text
          className='Layer__tasks__badge__label'
          size={TextSize.sm}
          status={badgeConfig.color}
          invertColor={badgeConfig.color === 'warning'}
          weight={TextWeight.bold}
        >
          {badgeConfig.label}
        </Text>
      )}
      {badgeConfig.labelShort && (
        <Text
          className='Layer__tasks__badge__label-short'
          size={TextSize.sm}
          status={badgeConfig.color}
          invertColor={badgeConfig.color === 'warning'}
          weight={TextWeight.bold}
        >
          {badgeConfig.labelShort}
        </Text>
      )}
    </span>
  )
}
