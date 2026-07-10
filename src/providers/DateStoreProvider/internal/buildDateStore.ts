import { createStore } from 'zustand'

import type { DateRange } from '@utils/date/dateRange'
import { type DatePreset, derivePreset, resolveRangeForPreset } from '@utils/date/dateRangePresets'
import { getDateRange } from '@providers/DateStoreProvider/internal/dateStoreUtils'
import type { DateRangeWithPreset, DateStore } from '@providers/DateStoreProvider/internal/types'

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
  return createStore<DateStore>((set, get) => {
    // Store an already-final range with an explicit preset.
    const applyPreset = (range: DateRange, preset: DatePreset): DateRangeWithPreset => {
      const next = { startDate: range.startDate, endDate: range.endDate, preset }
      set(next)
      return next
    }

    // Store an already-final range, deriving the preset it represents.
    const applyDerived = (range: DateRange, activationDate?: Date): DateRangeWithPreset =>
      applyPreset(range, derivePreset(range, get().preset, activationDate))

    // Set an explicit range; derive the preset it represents.
    const setDateRange = (range: DateRange, activationDate?: Date): DateRangeWithPreset => {
      const [startDate, endDate] = range.startDate <= range.endDate
        ? [range.startDate, range.endDate]
        : [range.endDate, range.startDate]

      return applyDerived(getDateRange({ mode: 'full', startDate, endDate }), activationDate)
    }

    // Set by preset; resolve the concrete range.
    const setPresetRange = (
      { preset }: { preset: Exclude<DatePreset, DatePreset.Custom> },
      activationDate?: Date,
    ): DateRangeWithPreset => {
      const resolved = resolveRangeForPreset(preset, activationDate)
      // AllTime before the activation date is known: keep the current selection.
      if (resolved === null) return { startDate: get().startDate, endDate: get().endDate, preset: get().preset }
      return applyPreset(getDateRange({ mode: 'full', startDate: resolved.startDate, endDate: resolved.endDate }), preset)
    }

    const setDate = ({ date }: { date: Date }, activationDate?: Date): DateRangeWithPreset => {
      // Always clamp to start of month for date.
      const monthRange = getDateRange({ mode: 'month', endDate: date })
      const fullRange = getDateRange({ mode: 'full', startDate: date, endDate: date })
      return applyDerived({ startDate: monthRange.startDate, endDate: fullRange.endDate }, activationDate)
    }

    const setMonth = ({ startDate }: { startDate: Date }, activationDate?: Date): DateRangeWithPreset =>
      applyDerived(getDateRange({ mode: 'month', endDate: startDate }), activationDate)

    const setYear = ({ startDate }: { startDate: Date }, activationDate?: Date): DateRangeWithPreset =>
      applyDerived(getDateRange({ mode: 'year', endDate: startDate }), activationDate)

    return {
      ...getDateRange({ mode: 'full', startDate: initialRange.startDate, endDate: initialRange.endDate }),
      preset: initialPreset,

      actions: {
        setDate,
        setDateRange,
        setPresetRange,
        setMonth,
        setYear,

        setMonthByPeriod: ({ monthNumber, yearNumber }, activationDate) => {
          const effectiveMonthNumber = Math.min(Math.max(monthNumber, 1), 12)

          return setMonth({ startDate: new Date(yearNumber, effectiveMonthNumber - 1, 1) }, activationDate)
        },
      },
    }
  })
}
