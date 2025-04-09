import AlertCircle from '../../icons/AlertCircle'
import Clock from '../../icons/Clock'
import { Text, TextSize, TextWeight } from '../Typography/Text'
import CheckCircle from '../../icons/CheckCircle'
import { BookkeepingPeriod } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import pluralize from 'pluralize'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'

type TaskStatusBadgeProps = {
  status: BookkeepingPeriod['status']
  tasksCount?: number
}

const buildBadgeConfig = (status: TaskStatusBadgeProps['status'], tasksCount: TaskStatusBadgeProps['tasksCount']) => {
  switch (status) {
    case 'IN_PROGRESS_AWAITING_BOOKKEEPER':
    case 'NOT_STARTED':
    case 'CLOSING_IN_REVIEW':
      return {
        color: 'info' as const,
        icon: <Clock size={12} />,
        label: tasksCount ? pluralize('task', tasksCount, true) : undefined,
        labelShort: tasksCount ? `${tasksCount}` : undefined,
      }
    case 'IN_PROGRESS_AWAITING_CUSTOMER':
      return {
        color: 'warning' as const,
        label: pluralize('task', tasksCount, true),
        labelShort: `${tasksCount}`,
        icon: <AlertCircle size={12} />,
      }
    case 'CLOSED_OPEN_TASKS':
      return {
        color: 'error' as const,
        label: pluralize('task', tasksCount, true),
        labelShort: `${tasksCount}`,
        icon: <AlertCircle size={12} />,
      }
    case 'CLOSED_COMPLETE':
      return {
        color: 'success' as const,
        icon: <CheckCircle size={12} />,
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
