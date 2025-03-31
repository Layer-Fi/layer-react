import AlertCircle from '../../icons/AlertCircle'
import Clock from '../../icons/Clock'
import { Text, TextSize, TextStatus, TextWeight } from '../Typography/Text'
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
        color: 'info' as TextStatus,
        icon: <Clock size={12} />,
      }
    case 'IN_PROGRESS_AWAITING_CUSTOMER':
      return {
        label: pluralize('task', tasksCount, true),
        color: 'warning' as TextStatus,
        icon: <AlertCircle size={12} />,
      }
    case 'CLOSED_OPEN_TASKS':
      return {
        label: pluralize('task', tasksCount, true),
        color: 'error' as TextStatus,
        icon: <AlertCircle size={12} />,
      }
    case 'CLOSED_COMPLETE':
      return {
        color: 'success' as TextStatus,
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
      <Text size={TextSize.sm} status={badgeConfig.color} invertColor={true} weight={TextWeight.bold}>{badgeConfig.label}</Text>
    </span>
  )
}
