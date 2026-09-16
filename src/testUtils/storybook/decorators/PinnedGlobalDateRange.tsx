import { type PropsWithChildren, useLayoutEffect, useState } from 'react'

import { type DateRange, useGlobalDateRangeActions } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'

type PinnedGlobalDateRangeProps = PropsWithChildren<{
  dateRange: DateRange
}>

let isPinningEnabled = true

/**
 * Turned off for the real-backend Storybook, where a fixture-year range would query periods a live
 * business has no data for. Set from `.storybook/preview.tsx`.
 */
export const setDateRangePinning = (enabled: boolean) => {
  isPinningEnabled = enabled
}

/**
 * Pins the global date store to a fixed range before rendering children, so
 * stories and tests don't depend on the real clock. Children stay unmounted
 * until the pin lands to keep them from fetching for the current month first.
 */
export const PinnedGlobalDateRange = ({ dateRange, children }: PinnedGlobalDateRangeProps) => {
  const { setDateRange } = useGlobalDateRangeActions()
  const [isPinned, setIsPinned] = useState(false)

  useLayoutEffect(() => {
    if (isPinningEnabled) setDateRange(dateRange)
    setIsPinned(true)
  }, [setDateRange, dateRange])

  return isPinned ? <>{children}</> : null
}
