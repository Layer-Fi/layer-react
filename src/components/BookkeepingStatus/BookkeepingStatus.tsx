import { ReactNode } from 'react'
import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import AlertCircle from '../../icons/AlertCircle'
import CheckCircle from '../../icons/CheckCircle'
import Clock from '../../icons/Clock'
import { Text } from '../Typography'
import { TextSize, TextStatus } from '../Typography/Text'
import { getMonthNameFromNumber } from '../../utils/date'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'

type BookkeepingStatusProps = {
  month?: number
  status?: BookkeepingPeriodStatus
  emphasizeWarning?: boolean
}

type InternalStatusConfig = {
  label: string
  color: TextStatus
  icon: ReactNode
} | undefined

const buildStatus = (status: BookkeepingPeriodStatus, month: number): InternalStatusConfig => {
  const monthName = getMonthNameFromNumber(month)

  /** @TODO - review the following assignments */
  switch (status) {
    case 'IN_PROGRESS_NO_TASKS':
    case 'NOT_STARTED':
      return {
        label: 'Books in progress',
        color: 'info' as TextStatus,
        icon: <Clock size={12} />,
      }
    case 'CLOSED_IN_REVIEW':
      return {
        label: 'Books in review',
        color: 'info',
        icon: <Clock size={12} />,
      }
    case 'IN_PROGRESS_OPEN_TASKS':
    case 'CLOSED_OPEN_TASKS':
      return {
        label: `${monthName} books - Action required`,
        color: 'warning',
        icon: <AlertCircle size={12} />,
      }
    case 'CLOSED_COMPLETE':
      return {
        label: 'Books completed',
        color: 'success',
        icon: <CheckCircle size={12} />,
      }
  }
}

export const BookkeepingStatus = ({ status, month, emphasizeWarning }: BookkeepingStatusProps) => {
  if (!status || month === undefined) {
    return
  }

  const statusConfig = buildStatus(status, month)

  if (!statusConfig) {
    return
  }

  const emphasize = statusConfig.color === 'warning' && emphasizeWarning
  const dataProperties = toDataProperties({ status: statusConfig.color, emphasize })

  return (
    <span className='Layer__bookkeping-status' {...dataProperties}>
      <span className='Layer__bookkeping-status__icon-wrapper' data-status={statusConfig.color}>
        {statusConfig.icon}
      </span>
      <Text size={TextSize.sm} status={statusConfig.color} invertColor={emphasize}>{statusConfig.label}</Text>
    </span>
  )
}
