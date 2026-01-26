import { isCategorizationEnabledForStatus } from '@utils/bookkeeping/isCategorizationEnabled'
import { useEffectiveBookkeepingStatus } from '@hooks/bookkeeping/useBookkeepingStatus'

export const useBankTransactionsIsCategorizationEnabled = () => {
  const effectiveBookkeepingStatus = useEffectiveBookkeepingStatus()
  const isCategorizationEnabled = isCategorizationEnabledForStatus(effectiveBookkeepingStatus)

  return isCategorizationEnabled
}
