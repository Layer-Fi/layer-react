import { BookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { safeAssertUnreachable } from '../switch/assertUnreachable'

export function isCategorizationEnabledForStatus(status: BookkeepingStatus) {
  switch (status) {
    case BookkeepingStatus.NOT_PURCHASED:
    case BookkeepingStatus.ONBOARDING:
    case BookkeepingStatus.BOOKKEEPING_PAUSED: {
      return true
    }
    case BookkeepingStatus.ACTIVE: {
      return false
    }
    default: {
      return safeAssertUnreachable({
        value: status,
        message: 'Unexpected bookkeeping status in `isCategorizationEnabledForStatus`',
        fallbackValue: true,
      })
    }
  }
}
