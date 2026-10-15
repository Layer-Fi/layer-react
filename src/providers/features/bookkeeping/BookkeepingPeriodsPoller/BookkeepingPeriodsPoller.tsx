import { type BookkeepingPeriod } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { isUnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTask'
import { usePollingConfig } from '@hooks/utils/swr/usePollingConfig'
import { useGetBookkeepingPeriods } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'

const POLL_INTERVAL_MS = 5000
const CONNECTION_MATCH_PENDING_TTL_MS = 2 * 60 * 1000

const hasPendingConnectionMatch = (periods: ReadonlyArray<BookkeepingPeriod> | undefined) =>
  periods?.some(({ tasks }) =>
    tasks.some(task => isUnifiedAskFormTask(task) && task.discoveredAccount?.connectionMatchPending === true),
  ) ?? false

export const BookkeepingPeriodsPoller = () => {
  const swrOptions = usePollingConfig({
    shouldContinue: hasPendingConnectionMatch,
    intervalMs: POLL_INTERVAL_MS,
    maxDurationMs: CONNECTION_MATCH_PENDING_TTL_MS,
  })

  useGetBookkeepingPeriods({ swrOptions })

  return null
}
