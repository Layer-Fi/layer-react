import type { BookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'

export function isCategorizationEnabledForStatus(status: BookkeepingStatus) {
  switch (status) {
    case 'NOT_PURCHASED':
    case 'BOOKKEEPING_PAUSED':
      return true
    case 'ACTIVE':
      return false
  }
}
