import { ReactNode } from 'react'
import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { getMonthNameFromNumber } from '../../utils/date'
import { TextStatus } from '../Typography/Text'
import AlertCircle from '../../icons/AlertCircle'
import Clock from '../../icons/Clock'
import CheckCircle from '../../icons/CheckCircle'
import { safeAssertUnreachable } from '../../utils/switch/safeAssertUnreachable'
import pluralize from 'pluralize'

type InternalStatusConfig = {
  label: string
  description: string
  color: TextStatus
  icon: ReactNode
}

type BookkeepingStatusConfigOptions = {
  status: BookkeepingPeriodStatus
  month: number
  incompleteTasksCount?: number
}

export function getBookkeepingStatusConfig({
  status,
  month,
  incompleteTasksCount,
}: BookkeepingStatusConfigOptions): InternalStatusConfig | undefined {
  const monthName = getMonthNameFromNumber(month)

  const actionPhrase = incompleteTasksCount !== undefined && incompleteTasksCount > 0
    ? `Please complete the ${pluralize('open task', incompleteTasksCount, true)}.`
    : 'No action is needed from you right now.'

  switch (status) {
    case 'IN_PROGRESS_AWAITING_BOOKKEEPER':
    case 'NOT_STARTED':
      return {
        label: 'Books in progress',
        description: `We're working on your ${monthName} books. ${actionPhrase}`,
        color: 'info',
        icon: <Clock size={12} />,
      }
    case 'CLOSING_IN_REVIEW':
      return {
        label: 'Books in review',
        description: `We're working on your ${monthName} books. ${actionPhrase}`,
        color: 'info',
        icon: <Clock size={12} />,
      }
    case 'IN_PROGRESS_AWAITING_CUSTOMER':
      return {
        label: `${monthName} books - Action required`,
        description: `Please respond to the below tasks to help us complete your ${monthName} books.`,
        color: 'warning',
        icon: <AlertCircle size={12} />,
      }
    case 'CLOSED_OPEN_TASKS':
      return {
        label: `${monthName} books - Action required`,
        description: `Please respond to the below tasks to help us complete your ${monthName} books.`,
        color: 'error',
        icon: <AlertCircle size={12} />,
      }
    case 'CLOSED_COMPLETE':
      return {
        label: 'Books completed',
        description: `Your ${monthName} books are complete and ready to view!`,
        color: 'success',
        icon: <CheckCircle size={12} />,
      }
    case 'BOOKKEEPING_NOT_PURCHASED':
      return
    default:
      return safeAssertUnreachable(status, 'Unexpected bookkeeping status in BookkeepingStatus')
  }
}
