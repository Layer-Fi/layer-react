import type { BookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'

type ActiveBookkeepingStatus = 'ACTIVE' | 'ONBOARDING'
export function isActiveBookkeepingStatus(status: BookkeepingStatus): status is ActiveBookkeepingStatus {
  return status === 'ACTIVE' || status === 'ONBOARDING'
}

type ActiveOrPausedBookkeepingStatus = ActiveBookkeepingStatus | 'BOOKKEEPING_PAUSED'
export function isActiveOrPausedBookkeepingStatus(status: BookkeepingStatus): status is ActiveOrPausedBookkeepingStatus {
  return isActiveBookkeepingStatus(status) || status === 'BOOKKEEPING_PAUSED'
}
