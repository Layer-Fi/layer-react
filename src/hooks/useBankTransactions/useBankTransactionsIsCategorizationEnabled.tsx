import { isCategorizationEnabledForStatus } from '@utils/bookkeeping/isCategorizationEnabled'
import { useEffectiveBookkeepingStatus } from '@hooks/bookkeeping/useBookkeepingStatus'

export const useBankTransactionsIsCategorizationEnabled = ({ categorizeView }: { categorizeView?: boolean }) => {
  const effectiveBookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(effectiveBookkeepingStatus)

  if (categorizeView === false) {
    return false
  }
  if (categorizeView === true) {
    return true
  }
  if (categorizationEnabled) {
    return true
  }
  return false
}
