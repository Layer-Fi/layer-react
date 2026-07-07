import { createStore } from 'zustand'

import { ALL_TIME_MIN_DATE, DatePreset, type DateRange, rangeForSelectablePreset } from '@utils/date/dateRange'
import { correctDateRange, getDateRange } from '@providers/DateStoreProvider/internal/dateStoreUtils'
import type { DateStore } from '@providers/DateStoreProvider/internal/types'

export type MakeDateStoreOptions = {
  initialDatePreset?: Exclude<DatePreset, DatePreset.Custom>
}

function getInitialRange({
  initialDatePreset = DatePreset.ThisMonth,
}: MakeDateStoreOptions): DateRange {
  // The store is built before any business context is available, so the initial
  // range uses "now" and the fixed activation fallback. Selecting a preset later
  // (via useDatePresets) recomputes with the real activation date.
  const now = new Date()
  const { startDate, endDate } = rangeForSelectablePreset(initialDatePreset, {
    now,
    activationDate: ALL_TIME_MIN_DATE,
  })
  return getDateRange({ mode: 'full', startDate, endDate })
}

export function buildDateStore(options: MakeDateStoreOptions = {}) {
  const initialRange = getInitialRange(options)

  return createStore<DateStore>((set) => {
    const apply = (next: DateRange): DateRange => {
      set(next)
      return next
    }

    const setDate = ({ date }: { date: Date }): DateRange => {
      // Always clamp to start of month for date.
      const monthRange = getDateRange({ mode: 'month', endDate: date })
      const fullRange = getDateRange({ mode: 'full', startDate: date, endDate: date })
      return apply({ startDate: monthRange.startDate, endDate: fullRange.endDate })
    }

    const setDateRange = ({ startDate, endDate }: DateRange): DateRange => {
      const corrected = correctDateRange({ startDate, endDate })
      return apply(getDateRange({ mode: 'full', ...corrected }))
    }

    const setMonth = ({ startDate }: { startDate: Date }): DateRange => {
      return apply(getDateRange({ mode: 'month', endDate: startDate }))
    }

    const setYear = ({ startDate }: { startDate: Date }): DateRange => {
      return apply(getDateRange({ mode: 'year', endDate: startDate }))
    }

    return {
      ...initialRange,

      actions: {
        setDate,
        setDateRange,
        setMonth,
        setYear,

        setMonthByPeriod: ({ monthNumber, yearNumber }) => {
          const effectiveMonthNumber = Math.min(Math.max(monthNumber, 1), 12)

          return setMonth({ startDate: new Date(yearNumber, effectiveMonthNumber - 1, 1) })
        },
      },
    }
  })
}
