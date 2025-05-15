import { BookkeepingPeriodStatus } from './useBookkeepingPeriods'

export enum CustomerFacingBookkeepingPeriodStatus {
  BOOKS_IN_PROGRESS = 'BOOKS_IN_PROGRESS',
  ACTION_REQUIRED = 'ACTION_REQUIRED',
  BOOKS_COMPLETED = 'BOOKS_COMPLETED',
}

export function getCustomerFacingBookkeepingPeriodStatus(status: BookkeepingPeriodStatus, hasOpenTasks: boolean) {
  switch (status) {
    case BookkeepingPeriodStatus.NOT_STARTED: {
      return CustomerFacingBookkeepingPeriodStatus.BOOKS_IN_PROGRESS
    }
    case BookkeepingPeriodStatus.CLOSING_IN_REVIEW:
    case BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER:
    case BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER: {
      return hasOpenTasks
        ? CustomerFacingBookkeepingPeriodStatus.ACTION_REQUIRED
        : CustomerFacingBookkeepingPeriodStatus.BOOKS_IN_PROGRESS
    }
    case BookkeepingPeriodStatus.CLOSED_OPEN_TASKS: {
      return hasOpenTasks
        ? CustomerFacingBookkeepingPeriodStatus.ACTION_REQUIRED
        : CustomerFacingBookkeepingPeriodStatus.BOOKS_COMPLETED
    }
    case BookkeepingPeriodStatus.CLOSED_COMPLETE: {
      return CustomerFacingBookkeepingPeriodStatus.BOOKS_COMPLETED
    }
    case BookkeepingPeriodStatus.BOOKKEEPING_NOT_ACTIVE:
    default: {
      return undefined
    }
  }
}
