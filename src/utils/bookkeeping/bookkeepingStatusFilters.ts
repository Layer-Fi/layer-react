import { BookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'

type ActiveBookkeepingStatus = BookkeepingStatus.ACTIVE | BookkeepingStatus.ONBOARDING
export function isActiveBookkeepingStatus(status: BookkeepingStatus): status is ActiveBookkeepingStatus {
  return status === BookkeepingStatus.ACTIVE || status === BookkeepingStatus.ONBOARDING
}

type ActiveOrPausedBookkeepingStatus = ActiveBookkeepingStatus | BookkeepingStatus.BOOKKEEPING_PAUSED
export function isActiveOrPausedBookkeepingStatus(status: BookkeepingStatus): status is ActiveOrPausedBookkeepingStatus {
  return isActiveBookkeepingStatus(status) || status === BookkeepingStatus.BOOKKEEPING_PAUSED
}
