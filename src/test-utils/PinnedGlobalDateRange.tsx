import { type PropsWithChildren, useEffect, useState } from 'react'

import { type DateRange, useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'

type PinnedGlobalDateRangeProps = PropsWithChildren<{
  dateRange: DateRange
}>

/**
 * Pins the global date store to a fixed range before rendering children, so
 * stories and tests don't depend on the real clock. Children stay unmounted
 * until the pin lands to keep them from fetching for the current month first.
 */
export const PinnedGlobalDateRange = ({ dateRange, children }: PinnedGlobalDateRangeProps) => {
  const { setDateRange } = useGlobalDateRangeActions()
  const [isPinned, setIsPinned] = useState(false)

  useEffect(() => {
    setDateRange(dateRange)
    setIsPinned(true)
  }, [setDateRange, dateRange])

  return isPinned ? <>{children}</> : null
}
