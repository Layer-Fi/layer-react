import { createStore } from 'zustand'

import type { DateRange } from '@utils/date/dateRange'
import { type DatePreset, deriveDateRangeFromPreset, derivePresetFromDateRange } from '@utils/date/dateRangePresets'
import { getDateRange } from '@providers/DateStoreProvider/internal/dateStoreUtils'
import type { DateRangeWithPreset, DateStore } from '@providers/DateStoreProvider/internal/types'

export type MakeDateStoreOptions = {
  initialDatePreset?: Exclude<DatePreset, DatePreset.Custom>
}

export type BuildDateStoreOptions = {
  initialRange: DateRange
  initialPreset: DatePreset
}

export function buildDateStore({ initialRange, initialPreset }: BuildDateStoreOptions) {
  return createStore<DateStore>((set, get) => {
    const applyDateRangeWithPreset = (range: DateRange, preset: DatePreset): DateRangeWithPreset => {
      const next = { startDate: range.startDate, endDate: range.endDate, preset }
      set(next)
      return next
    }

    const applyDerived = (dateRange: DateRange, activationDate?: Date): DateRangeWithPreset =>
      applyDateRangeWithPreset(dateRange, derivePresetFromDateRange(dateRange, get().preset, activationDate))

    // Set an explicit range; derive the preset it represents.
    const setDateRange = (range: DateRange, activationDate?: Date): DateRangeWithPreset => {
      const [startDate, endDate] = range.startDate <= range.endDate
        ? [range.startDate, range.endDate]
        : [range.endDate, range.startDate]

      return applyDerived(getDateRange({ mode: 'full', startDate, endDate }), activationDate)
    }

    const setDate = (date: Date, activationDate?: Date): DateRangeWithPreset => {
      const monthRange = getDateRange({ mode: 'month', endDate: date })
      const fullRange = getDateRange({ mode: 'full', startDate: date, endDate: date })
      return applyDerived({ startDate: monthRange.startDate, endDate: fullRange.endDate }, activationDate)
    }

    const setMonth = (date: Date, activationDate?: Date): DateRangeWithPreset =>
      applyDerived(getDateRange({ mode: 'month', endDate: date }), activationDate)

    const setYear = (date: Date, activationDate?: Date): DateRangeWithPreset =>
      applyDerived(getDateRange({ mode: 'year', endDate: date }), activationDate)

    const setDatePreset = (
      datePreset: Exclude<DatePreset, DatePreset.Custom>,
      activationDate?: Date,
    ): DateRangeWithPreset => {
      const resolvedDateRange = deriveDateRangeFromPreset(datePreset, activationDate)
      // AllTime before the activation date is known: keep the current selection.
      if (resolvedDateRange === null) return { startDate: get().startDate, endDate: get().endDate, preset: get().preset }
      return applyDateRangeWithPreset(getDateRange({ mode: 'full', startDate: resolvedDateRange.startDate, endDate: resolvedDateRange.endDate }), datePreset)
    }

    return {
      ...getDateRange({ mode: 'full', startDate: initialRange.startDate, endDate: initialRange.endDate }),
      preset: initialPreset,

      actions: {
        setDate,
        setDateRange,
        setDatePreset,
        setMonth,
        setYear,

        setMonthByPeriod: ({ monthNumber, yearNumber }, activationDate) => {
          const monthIndex = Math.min(Math.max(monthNumber, 1), 12) - 1
          const dayIndex = 1 // Hardcoded to the first day of the month
          return setMonth(new Date(yearNumber, monthIndex, dayIndex), activationDate)
        },
      },
    }
  })
}
