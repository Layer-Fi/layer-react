import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react'

import { type BookkeepingPeriod } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { getIncompleteTasks } from '@utils/features/bookkeeping/bookkeepingTasksFilters'
import { usePollingConfig } from '@hooks/utils/swr/usePollingConfig'
import { useGetBookkeepingPeriods } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'

const POLL_INTERVAL_MS = 5000
const POLL_DURATION_MS = 2 * 60 * 1000

const hasIncompleteTask = (periods: ReadonlyArray<BookkeepingPeriod>) =>
  periods.some(({ tasks }) => getIncompleteTasks(tasks).length > 0)

const shouldKeepPolling = (periods: ReadonlyArray<BookkeepingPeriod> | undefined) =>
  periods === undefined || hasIncompleteTask(periods)

const BookkeepingPeriodsRefreshContext = createContext<() => void>(() => {})

const BookkeepingPeriodsPoller = () => {
  const swrOptions = usePollingConfig({
    shouldContinue: shouldKeepPolling,
    intervalMs: POLL_INTERVAL_MS,
    maxDurationMs: POLL_DURATION_MS,
  })

  useGetBookkeepingPeriods({ swrOptions })

  return null
}

export function BookkeepingPeriodsRefreshProvider({ children }: PropsWithChildren) {
  const [pollUntil, setPollUntil] = useState<number | null>(null)

  const startPolling = useCallback(() => setPollUntil(Date.now() + POLL_DURATION_MS), [])

  useEffect(() => {
    if (pollUntil === null) return

    const timeout = setTimeout(() => setPollUntil(null), pollUntil - Date.now())
    return () => clearTimeout(timeout)
  }, [pollUntil])

  return (
    <BookkeepingPeriodsRefreshContext.Provider value={startPolling}>
      {pollUntil !== null ? <BookkeepingPeriodsPoller key={pollUntil} /> : null}
      {children}
    </BookkeepingPeriodsRefreshContext.Provider>
  )
}

export function useRefreshTasksAfterAccountLinked() {
  return useContext(BookkeepingPeriodsRefreshContext)
}
