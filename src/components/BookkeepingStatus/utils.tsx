import { ReactNode } from 'react'
import { BookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/useBookkeepingPeriods'
import { getMonthNameFromNumber } from '../../utils/date'
import { TextStatus } from '../Typography/Text'
import AlertCircle from '../../icons/AlertCircle'
import Clock from '../../icons/Clock'
import CheckCircle from '../../icons/CheckCircle'
import { CustomerFacingBookkeepingPeriodStatus, getCustomerFacingBookkeepingPeriodStatus } from '../../hooks/bookkeeping/periods/utils'

type InternalStatusConfig = {
  label: string
  description: string
  color: TextStatus
  icon: ReactNode
}

type BookkeepingStatusConfigOptions = {
  status: BookkeepingPeriodStatus
  monthNumber?: number
  incompleteTasksCount?: number
}

export function getBookkeepingStatusConfig({
  status,
  monthNumber,
  incompleteTasksCount,
}: BookkeepingStatusConfigOptions): InternalStatusConfig | undefined {
  const monthName = monthNumber !== undefined ? getMonthNameFromNumber(monthNumber) : ''
  const hasOpenTasks = incompleteTasksCount !== undefined && incompleteTasksCount > 0
  const customerFacingStatus = getCustomerFacingBookkeepingPeriodStatus(status, hasOpenTasks)

  switch (customerFacingStatus) {
    case CustomerFacingBookkeepingPeriodStatus.BOOKS_IN_PROGRESS: {
      return {
        label: 'Books in progress',
        description: `We're working on your ${monthName} books. No action is needed from you right now.`,
        color: 'info',
        icon: <Clock size={12} />,
      }
    }
    case CustomerFacingBookkeepingPeriodStatus.ACTION_REQUIRED: {
      return {
        label: 'Action required',
        description: `Please respond to the below tasks to help us complete your ${monthName} books.`,
        color: 'warning',
        icon: <AlertCircle size={12} />,
      }
    }
    case CustomerFacingBookkeepingPeriodStatus.BOOKS_COMPLETED: {
      return {
        label: 'Books completed',
        description: `Your ${monthName} books are complete and ready to view!`,
        color: 'success',
        icon: <CheckCircle size={12} />,
      }
    }
    default: {
      return undefined
    }
  }
}
