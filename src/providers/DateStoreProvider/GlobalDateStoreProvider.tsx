import { useContext, useMemo } from 'react'

import { getActivationDate } from '@utils/business'
import { clampToValidRange, type DateSelectionMode } from '@utils/date/dateRange'
import { createScopedDateStore } from '@providers/DateStoreProvider/internal/createScopedDateStore'
import { LayerContext } from '@contexts/LayerContext/LayerContext'

export type { DateRange, DateSelectionMode } from '@utils/date/dateRange'

const {
  Provider: GlobalDateStoreProvider,
  useDate: useGlobalDate,
  useDateActions: useGlobalDateActions,
  useDateRange: useRawGlobalDateRange,
  useDateRangeActions: useGlobalDateRangeActions,
  usePeriodAlignedActions: useGlobalDatePeriodAlignedActions,
} = createScopedDateStore()

/**
 * The store holds the raw selection (an "All Time" range keeps the fixed
 * fallback minimum as its start until we know better). This read clamps the
 * start up to the business activation date, so query consumers never send a
 * pre-activation start.
 *
 * Activation is read optionally: with no surrounding business context (e.g. in
 * isolation or before the business resolves) there is nothing to clamp to, and
 * the raw range is returned unchanged.
 */
function useGlobalDateRange(params: { dateSelectionMode: DateSelectionMode }) {
  const range = useRawGlobalDateRange(params)

  const business = useContext(LayerContext)?.business
  const activationDate = useMemo(() => getActivationDate(business), [business])

  return useMemo(
    () => (activationDate ? clampToValidRange(range, { now: new Date(), activationDate }) : range),
    [range, activationDate],
  )
}

export {
  GlobalDateStoreProvider,
  useGlobalDate,
  useGlobalDateActions,
  useGlobalDatePeriodAlignedActions,
  useGlobalDateRange,
  useGlobalDateRangeActions,
}
