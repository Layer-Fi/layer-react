import { useContext, useEffect, useMemo } from 'react'
import { isSameDay } from 'date-fns'

import { getActivationDate } from '@utils/business'
import { ALL_TIME_MIN_DATE, type DateRange } from '@utils/date/dateRange'
import { LayerContext } from '@contexts/LayerContext/LayerContext'

/**
 * A scoped date store is built before business context exists, so an "All Time"
 * range lands on the fixed fallback minimum (ALL_TIME_MIN_DATE). Once the real
 * business activation date is known, adopt it as the range start.
 */
export function useSyncDateRangeWithActivation(
  range: DateRange,
  setDateRange: (range: DateRange) => void,
) {
  const business = useContext(LayerContext)?.business
  const activationDate = useMemo(() => getActivationDate(business), [business])

  useEffect(() => {
    if (!activationDate) return
    if (!isSameDay(range.startDate, ALL_TIME_MIN_DATE)) return // Start date was already set or changed by the user
    if (isSameDay(range.startDate, activationDate)) return // Start date is already the activation date

    setDateRange({ startDate: activationDate, endDate: range.endDate })
  }, [activationDate, range.startDate, range.endDate, setDateRange])
}
