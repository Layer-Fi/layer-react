import { Text, TextSize, TextWeight } from '@components/Typography/Text'
import AlertCircle from '@icons/AlertCircle'
import Clock from '@icons/Clock'
import CheckCircle from '@icons/CheckCircle'
import { BookkeepingPeriod, BookkeepingPeriodStatus } from '@hooks/bookkeeping/periods/useBookkeepingPeriods'
import pluralize from 'pluralize'
import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { safeAssertUnreachable } from '@utils/switch/assertUnreachable'

type TaskStatusBadgeProps = {
  status: BookkeepingPeriod['status']
  tasksCount?: number
}

const buildBadgeConfig = (status: TaskStatusBadgeProps['status'], tasksCount: TaskStatusBadgeProps['tasksCount']) => {
  switch (status) {
    case BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER:
    case BookkeepingPeriodStatus.NOT_STARTED:
    case BookkeepingPeriodStatus.CLOSING_IN_REVIEW: {
      return {
        color: 'info' as const,
        icon: <Clock size={12} />,
        label: tasksCount ? pluralize('task', tasksCount, true) : undefined,
        labelShort: tasksCount ? `${tasksCount}` : undefined,
      }
    }
    case BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER:
    case BookkeepingPeriodStatus.CLOSED_OPEN_TASKS: {
      return {
        color: 'warning' as const,
        label: tasksCount ? pluralize('task', tasksCount, true) : undefined,
        labelShort: tasksCount ? `${tasksCount}` : undefined,
        icon: <AlertCircle size={12} />,
      }
    }
    case BookkeepingPeriodStatus.CLOSED_COMPLETE: {
      return {
        color: 'success' as const,
        icon: <CheckCircle size={12} />,
      }
    }
    case BookkeepingPeriodStatus.BOOKKEEPING_NOT_ACTIVE: {
      return
    }
    default: {
      return safeAssertUnreachable({
        value: status,
        message: 'Unexpected bookkeeping status in `TaskStatusBadge`',
        fallbackValue: undefined,
      })
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
