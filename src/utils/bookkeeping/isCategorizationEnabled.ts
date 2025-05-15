import { BookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'

export function isCategorizationEnabledForStatus(status: BookkeepingStatus) {
  switch (status) {
    case BookkeepingStatus.NOT_PURCHASED:
    case BookkeepingStatus.ONBOARDING:
    case BookkeepingStatus.BOOKKEEPING_PAUSED:
      return true
    case BookkeepingStatus.ACTIVE:
      return false
  }
}
