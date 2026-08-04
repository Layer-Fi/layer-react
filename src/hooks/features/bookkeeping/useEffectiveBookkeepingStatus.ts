import { BookkeepingStatus } from '@schemas/bookkeeping/bookkeepingStatus'
import { useGetBookkeepingStatus } from '@api/businesses/[business-id]/bookkeeping/status/get'
import { useLegacyMode } from '@providers/bankTransactions/LegacyMode/LegacyModeProvider'

export function useEffectiveBookkeepingStatus(): BookkeepingStatus {
  const { overrideMode } = useLegacyMode()
  const { data } = useGetBookkeepingStatus()

  if (overrideMode === 'bookkeeping-client') {
    return BookkeepingStatus.ACTIVE
  }

  return data?.status ?? BookkeepingStatus.NOT_PURCHASED
}
