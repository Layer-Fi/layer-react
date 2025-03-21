import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import AlertCircle from '../../icons/AlertCircle'
import { Text } from '../Typography'
import { TextSize, TextStatus } from '../Typography/Text'

type BookkeepingStatusProps = {
  month?: number
  status?: BookkeepingPeriodStatus
}

/** @TODO - to utils */
const getMonthName = (month: number): string => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return monthNames[month]
}

const buildStatus = (status: BookkeepingPeriodStatus, month: number): { label: string, color: TextStatus } | undefined => {
  const monthName = getMonthName(month)

  switch (status) {
    case 'CLOSING_NOT_STARTED':
    case 'CLOSING_IN_PROGRESS':
      return {
        label: 'Books in progress',
        color: 'info',
      }
    case 'PROVISIONALLY_COMPLETE':
      return {
        label: `${monthName} books in progress - Action required`,
        color: 'warning',
      }
    case 'CLOSED':
      return {
        label: 'Books completed',
        color: 'success',
      }
  }
}

export const BookkeepingStatus = ({ status, month }: BookkeepingStatusProps) => {
  if (!status || !month) {
    return
  }

  const statusConfig = buildStatus(status, month)

  if (!statusConfig) {
    return
  }

  return (
    <span className='Layer__bookkeping-status'>
      <span className='Layer__bookkeping-status__icon-wrapper' data-status={statusConfig.color}>
        <AlertCircle size={12} />
      </span>
      <Text size={TextSize.sm} status={statusConfig.color}>{statusConfig.label}</Text>
    </span>
  )
}
