import { type PropsWithChildren } from 'react'

import { type BookkeepingPeriod } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { isUnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTask'
import { usePollingConfig } from '@hooks/utils/swr/usePollingConfig'
import { useGetBookkeepingPeriods } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'

const POLL_INTERVAL_MS = 5000

const hasPendingConnectionMatch = (periods: ReadonlyArray<BookkeepingPeriod> | undefined) =>
  periods?.some(({ tasks }) =>
    tasks.some(task => isUnifiedAskFormTask(task) && task.discoveredAccount?.connectionMatchPending === true),
  ) ?? false

const BookkeepingPeriodsPoller = () => {
  const swrOptions = usePollingConfig({
    shouldContinue: hasPendingConnectionMatch,
    intervalMs: POLL_INTERVAL_MS,
  })

  useGetBookkeepingPeriods({ swrOptions })

  return null
}

export function BookkeepingPeriodsRefreshProvider({ children }: PropsWithChildren) {
  return (
    <>
      <BookkeepingPeriodsPoller />
      {children}
    </>
  )
}
