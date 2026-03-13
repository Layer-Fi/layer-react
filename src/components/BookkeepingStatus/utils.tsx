import { type ReactNode } from 'react'
import type { TFunction } from 'i18next'

import { getMonthNameFromNumber } from '@utils/date'
import { tPlural } from '@utils/i18n/plural'
import { safeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { BookkeepingPeriodStatus } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
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
  status: BookkeepingPeriodStatus
  monthNumber?: number
  incompleteTasksCount?: number
  locale?: string
}

export function getBookkeepingStatusConfig(
  options: BookkeepingStatusConfigOptions,
  t: TFunction,
): InternalStatusConfig | undefined {
  const { status, monthNumber, incompleteTasksCount, locale = 'en-US' } = options
  const monthName = monthNumber !== undefined ? getMonthNameFromNumber(monthNumber, locale) : ''
  const inProgressDescription = incompleteTasksCount !== undefined && incompleteTasksCount > 0
    ? tPlural(t, 'wereWorkingOnYourMonthNameBooksPleaseCompleteTheCountOpenTasks', {
      count: incompleteTasksCount,
      monthName,
      one: 'We\'re working on your {{monthName}} books. Please complete the {{count}} open task.',
      other: 'We\'re working on your {{monthName}} books. Please complete the {{count}} open tasks.',
    })
    : t(
      'wereWorkingOnYourMonthNameBooksNoActionIsNeededFromYouRightNow',
      'We\'re working on your {{monthName}} books. No action is needed from you right now.',
      { monthName },
    )

  switch (status) {
    case BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER:
    case BookkeepingPeriodStatus.NOT_STARTED:
    case BookkeepingPeriodStatus.CLOSING_IN_REVIEW: {
      return {
        label: t('booksInProgress', 'Books in progress'),
        description: inProgressDescription,
        color: 'info',
        icon: <Clock size={12} />,
      }
    }
    case BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER:
    case BookkeepingPeriodStatus.CLOSED_OPEN_TASKS: {
      return {
        label: t('actionRequired', 'Action required'),
        description: t('pleaseRespondToTheBelowTasksToHelpUsCompleteYourMonthNameBooks', 'Please respond to the below tasks to help us complete your {{monthName}} books.', { monthName }),
        color: 'warning',
        icon: <AlertCircle size={12} />,
      }
    }
    case BookkeepingPeriodStatus.CLOSED_COMPLETE: {
      return {
        label: t('booksCompleted', 'Books completed'),
        description: t('yourMonthNameBooksAreCompleteAndReadyToView', 'Your {{monthName}} books are complete and ready to view!', { monthName }),
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
