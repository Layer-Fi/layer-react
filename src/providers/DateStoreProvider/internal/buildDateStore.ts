import { createStore } from 'zustand'

import type { DateRange } from '@utils/date/dateRange'
import { DatePreset } from '@utils/date/dateRangePresets'
import { getDateRange, withCorrectedRange } from '@providers/DateStoreProvider/internal/dateStoreUtils'
import type { DateStore } from '@providers/DateStoreProvider/internal/types'

/** Public factory option: configure the store by preset, not by concrete dates. */
export type MakeDateStoreOptions = {
  initialDatePreset?: Exclude<DatePreset, DatePreset.Custom>
}

/** Internal build input: the range has already been resolved (see `useResolvedInitialRange`). */
export type BuildDateStoreOptions = {
  initialRange: DateRange
  initialPreset: DatePreset
}

export function buildDateStore({ initialRange, initialPreset }: BuildDateStoreOptions) {
  return createStore<DateStore>((set) => {
    const apply = (next: DateRange, preset: DatePreset): DateRange => {
      set({ ...next, preset })
      return next
    }

    // Direct range mutations no longer correspond to a named preset.
    const setDate = ({ date }: { date: Date }): DateRange => {
      // Always clamp to start of month for date.
      const monthRange = getDateRange({ mode: 'month', endDate: date })
      const fullRange = getDateRange({ mode: 'full', startDate: date, endDate: date })
      return apply({ startDate: monthRange.startDate, endDate: fullRange.endDate }, DatePreset.Custom)
    }

    const setDateRange = withCorrectedRange(({ startDate, endDate }): DateRange => {
      return apply(getDateRange({ mode: 'full', startDate, endDate }), DatePreset.Custom)
    })

    const setMonth = ({ startDate }: { startDate: Date }): DateRange => {
      return apply(getDateRange({ mode: 'month', endDate: startDate }), DatePreset.Custom)
    }

    const setYear = ({ startDate }: { startDate: Date }): DateRange => {
      return apply(getDateRange({ mode: 'year', endDate: startDate }), DatePreset.Custom)
    }

    const setPresetRange = withCorrectedRange(
      ({ preset, startDate, endDate }: { preset: DatePreset } & DateRange): DateRange => {
        return apply(getDateRange({ mode: 'full', startDate, endDate }), preset)
      },
    )

    return {
      ...initialRange,
      preset: initialPreset,

      actions: {
        setDate,
        setDateRange,
        setMonth,
        setYear,
        setPresetRange,

        setMonthByPeriod: ({ monthNumber, yearNumber }) => {
          const effectiveMonthNumber = Math.min(Math.max(monthNumber, 1), 12)

          return setMonth({ startDate: new Date(yearNumber, effectiveMonthNumber - 1, 1) })
        },
      },
    }
  })
}
