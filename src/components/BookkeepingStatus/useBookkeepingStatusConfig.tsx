import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { safeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { BookkeepingPeriodStatus } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import AlertCircle from '@icons/AlertCircle'
import CheckCircle from '@icons/CheckCircle'
import Clock from '@icons/Clock'
import { type TextStatus } from '@components/Typography/Text'

type InternalStatusConfig = {
  label: string
  description: string
  color: TextStatus
  icon: ReactNode
}

type BookkeepingStatusConfigOptions = {
  status?: BookkeepingPeriodStatus
  monthNumber?: number
  incompleteTasksCount?: number
}

export function useBookkeepingStatusConfig(
  options: BookkeepingStatusConfigOptions,
): InternalStatusConfig | undefined {
  const { t } = useTranslation()
  const { formatMonthName, formatNumber } = useIntlFormatter()
  const { status, monthNumber, incompleteTasksCount } = options

  if (!status) return

  const monthName = monthNumber !== undefined ? formatMonthName(monthNumber) : ''
  const inProgressDescription = incompleteTasksCount !== undefined && incompleteTasksCount > 0
    ? tPlural(t, 'bookkeeping:label.working_on_books_please_complete_tasks', {
      count: incompleteTasksCount,
      displayCount: formatNumber(incompleteTasksCount),
      monthName,
      one: 'We\'re working on your {{monthName}} books. Please complete the {{displayCount}} open task.',
      other: 'We\'re working on your {{monthName}} books. Please complete the {{displayCount}} open tasks.',
    })
    : t(
      'bookkeeping:label.working_on_books_no_action_needed',
      'We\'re working on your {{monthName}} books. No action is needed from you right now.',
      { monthName },
    )

  switch (status) {
    case BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER:
    case BookkeepingPeriodStatus.NOT_STARTED:
    case BookkeepingPeriodStatus.CLOSING_IN_REVIEW: {
      return {
        label: t('bookkeeping:state.books_in_progress', 'Books in progress'),
        description: inProgressDescription,
        color: 'info',
        icon: <Clock size={12} />,
      }
    }
    case BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER:
    case BookkeepingPeriodStatus.CLOSED_OPEN_TASKS: {
      return {
        label: t('bookkeeping:state.action_required', 'Action required'),
        description: t('bookkeeping:label.respond_to_below_tasks', 'Please respond to the below tasks to help us complete your {{monthName}} books.', { monthName }),
        color: 'warning',
        icon: <AlertCircle size={12} />,
      }
    }
    case BookkeepingPeriodStatus.CLOSED_COMPLETE: {
      return {
        label: t('bookkeeping:state.books_completed', 'Books completed'),
        description: t('bookkeeping:label.month_name_books_complete', 'Your {{monthName}} books are complete and ready to view!', { monthName }),
        color: 'success',
        icon: <CheckCircle size={12} />,
      }
    }
    case BookkeepingPeriodStatus.BOOKKEEPING_NOT_ACTIVE: {
      return
    }
    default: {
      return safeAssertUnreachable({
        value: status,
        message: 'Unexpected bookkeeping status in BookkeepingStatus',
        fallbackValue: undefined,
      })
    }
  }
}
