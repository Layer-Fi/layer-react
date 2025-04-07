import { ReactNode } from 'react'
import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { getMonthNameFromNumber } from '../../utils/date'
import { TextStatus } from '../Typography/Text'
import AlertCircle from '../../icons/AlertCircle'
import Clock from '../../icons/Clock'
import CheckCircle from '../../icons/CheckCircle'
import { safeAssertUnreachable } from '../../utils/switch/safeAssertUnreachable'
import { isComplete, Task } from '../../types/tasks'
import { compareAsc } from 'date-fns'

type InternalStatusConfig = {
  label: string
  description: string
  color: TextStatus
  icon: ReactNode
} | undefined

export const buildStatus = (status: BookkeepingPeriodStatus, month: number): InternalStatusConfig => {
  const monthName = getMonthNameFromNumber(month)

  switch (status) {
    case 'IN_PROGRESS_AWAITING_BOOKKEEPER':
    case 'NOT_STARTED':
      return {
        label: 'Books in progress',
        description: `We're working on your ${monthName} books. No action is needed from you right now.`,
        color: 'info' as TextStatus,
        icon: <Clock size={12} />,
      }
    case 'CLOSING_IN_REVIEW':
      return {
        label: 'Books in review',
        description: `We're working on your ${monthName} books. No action is needed from you right now.`,
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

export function findLatestUnresolvedTask(tasks: Task[]) {
  const unresolvedTasks = tasks.filter(task => !isComplete(task.status)).sort((a, b) => {
    const aDate = new Date(a.effective_date)
    const bDate = new Date(b.effective_date)
    return compareAsc(aDate, bDate)
  })

  if (unresolvedTasks.length === 0) {
    return
  }

  return unresolvedTasks[0]
}
