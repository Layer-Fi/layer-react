import type { BookkeepingPeriod, BookkeepingPeriodStatus } from '../../../hooks/bookkeeping/periods/useBookkeepingPeriods'

type ActiveBookkeepingPeriodStatus = Exclude<BookkeepingPeriodStatus, 'BOOKKEEPING_NOT_ACTIVE'>

export function isActiveBookkeepingPeriod<T extends Pick<BookkeepingPeriod, 'status'>>(
  period: T,
): period is T & { status: ActiveBookkeepingPeriodStatus } {
  return period.status !== 'BOOKKEEPING_NOT_ACTIVE'
}
