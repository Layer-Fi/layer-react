import type { BookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { safeAssertUnreachable } from '../switch/assertUnreachable'

export function isCategorizationEnabledForStatus(status: BookkeepingStatus) {
  switch (status) {
    case 'NOT_PURCHASED':
    case 'ONBOARDING':
    case 'BOOKKEEPING_PAUSED':
      return true
    case 'ACTIVE':
      return false
    default:
      return safeAssertUnreachable({
        value: status,
        message: 'Unexpected bookkeeping status in `isCategorizationEnabledForStatus`',
        fallbackValue: true,
      })
  }
}
