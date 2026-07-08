import { useContext, useEffect, useMemo } from 'react'
import { isSameDay } from 'date-fns'

import { getActivationDate } from '@utils/business'
import { ALL_TIME_MIN_DATE, type DateRange } from '@utils/date/dateRange'
import { LayerContext } from '@contexts/LayerContext/LayerContext'

/**
 * A scoped date store is built before business context exists, so an "All Time"
 * range lands on the fixed fallback minimum (ALL_TIME_MIN_DATE). Once the real
 * business activation date is known, adopt it as the range start — but only
 * while the range is still that untouched fallback, so we never clobber a user
 * change.
 *
 * Loop-safe: after the rewrite the start is the activation date, so the
 * ALL_TIME_MIN_DATE guard no longer matches and the effect no-ops.
 *
 * Shared by every date store (the global store and any future scoped store).
 * Activation is read optionally rather than via useBusinessActivationDate: a
 * store may render without a surrounding BusinessProvider (e.g. in isolation or
 * unit tests), in which case there is nothing to adopt and the sync no-ops,
 * keeping the store itself context-free.
 */
export function useSyncDateRangeWithActivation(
  range: DateRange,
  setDateRange: (range: DateRange) => void,
) {
  const business = useContext(LayerContext)?.business
  const activationDate = useMemo(() => getActivationDate(business), [business])

  useEffect(() => {
    if (!activationDate || !isSameDay(range.startDate, ALL_TIME_MIN_DATE)) return

    setDateRange({ startDate: activationDate, endDate: range.endDate })
  }, [activationDate, range.startDate, range.endDate, setDateRange])
}
