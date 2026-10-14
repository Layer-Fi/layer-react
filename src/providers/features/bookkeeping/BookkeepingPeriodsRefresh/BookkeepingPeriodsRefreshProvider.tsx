import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react'

import { type BookkeepingPeriod } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { getIncompleteTasks } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { useGetBookkeepingPeriods } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'

const POLL_INTERVAL_MS = 5000
const POLL_DURATION_MS = 2 * 60 * 1000

const hasIncompleteTask = (periods: ReadonlyArray<BookkeepingPeriod>) =>
  periods.some(({ tasks }) => getIncompleteTasks(tasks).length > 0)

const BookkeepingPeriodsRefreshContext = createContext<() => void>(() => {})

/*
 * SWR's refresh loop ends for good once `refreshInterval` returns 0, so each poll window is a fresh
 * mount (keyed by its deadline) rather than a timer. Unknown data keeps the loop alive until it loads.
 */
const BookkeepingPeriodsPoller = ({ pollUntil }: { pollUntil: number }) => {
  const refreshInterval = useCallback(
    (periods?: ReadonlyArray<BookkeepingPeriod>) =>
      Date.now() < pollUntil && (periods === undefined || hasIncompleteTask(periods)) ? POLL_INTERVAL_MS : 0,
    [pollUntil],
  )
  const swrOptions = useMemo(() => ({ refreshInterval }), [refreshInterval])

  useGetBookkeepingPeriods({ swrOptions })

  return null
}

export function BookkeepingPeriodsRefreshProvider({ children }: PropsWithChildren) {
  const [pollUntil, setPollUntil] = useState<number | null>(null)

  const startPolling = useCallback(() => setPollUntil(Date.now() + POLL_DURATION_MS), [])

  return (
    <BookkeepingPeriodsRefreshContext.Provider value={startPolling}>
      {pollUntil !== null ? <BookkeepingPeriodsPoller key={pollUntil} pollUntil={pollUntil} /> : null}
      {children}
    </BookkeepingPeriodsRefreshContext.Provider>
  )
}

export function useRefreshTasksAfterAccountLinked() {
  return useContext(BookkeepingPeriodsRefreshContext)
}
