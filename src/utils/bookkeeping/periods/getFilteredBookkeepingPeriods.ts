import { BookkeepingPeriodStatus } from '@schemas/bookkeeping/bookkeepingPeriods'
import { type BookkeepingPeriod } from '@schemas/bookkeeping/bookkeepingPeriods'

type ActiveBookkeepingPeriodStatus = Exclude<BookkeepingPeriodStatus, BookkeepingPeriodStatus.BOOKKEEPING_NOT_ACTIVE>

export function isActiveBookkeepingPeriod<T extends Pick<BookkeepingPeriod, 'status'>>(
  period: T,
): period is T & { status: ActiveBookkeepingPeriodStatus } {
  return period.status !== BookkeepingPeriodStatus.BOOKKEEPING_NOT_ACTIVE
}
