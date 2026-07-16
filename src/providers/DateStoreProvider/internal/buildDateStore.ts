import { createStore } from 'zustand'

import type { DateRange } from '@utils/date/dateRange'
import { getDateRange, maybeInvertDateRange } from '@utils/date/dateRange'
import { type DatePreset, deriveDateRangeFromPreset, derivePresetFromDateRange, type SelectableDatePreset } from '@utils/date/dateRangePresets'
import type { DateRangeWithPreset, DateStore } from '@providers/DateStoreProvider/internal/types'

export type MakeDateStoreOptions = {
  initialDatePreset?: SelectableDatePreset
}

export type BuildDateStoreOptions = {
  initialRange: DateRange
  initialPreset: DatePreset
}

export function buildDateStore({ initialRange, initialPreset }: BuildDateStoreOptions) {
  return createStore<DateStore>((set, get) => {
    const setDateRangeWithPreset = (range: DateRange, preset: DatePreset): DateRangeWithPreset => {
      const next = { startDate: range.startDate, endDate: range.endDate, preset }
      set(next)
      return next
    }
    const setDateRangeWithDerivedPreset = (dateRange: DateRange, activationDate?: Date): DateRangeWithPreset => {
      const derivedPreset = derivePresetFromDateRange(dateRange, get().preset, activationDate)
      return setDateRangeWithPreset(dateRange, derivedPreset)
    }

    const setDateRange = ({ startDate, endDate, activationDate }: { startDate: Date, endDate: Date, activationDate?: Date }): DateRangeWithPreset => {
      const effectiveDateRange = getDateRange({ mode: 'full', ...maybeInvertDateRange({ startDate, endDate }) })
      return setDateRangeWithDerivedPreset(effectiveDateRange, activationDate)
    }

    const setDate = ({ date, activationDate }: { date: Date, activationDate?: Date }): DateRangeWithPreset => {
      const monthRange = getDateRange({ mode: 'month', endDate: date })
      const fullRange = getDateRange({ mode: 'full', startDate: date, endDate: date })

      const startOfMonth = monthRange.startDate
      const clampedEndDate = fullRange.endDate
      const effectiveDateRange = { startDate: startOfMonth, endDate: clampedEndDate }

      return setDateRangeWithDerivedPreset(effectiveDateRange, activationDate)
    }

    const setMonth = ({ startDate, activationDate }: { startDate: Date, activationDate?: Date }): DateRangeWithPreset => {
      const effectiveDateRange = getDateRange({ mode: 'month', endDate: startDate })
      return setDateRangeWithDerivedPreset(effectiveDateRange, activationDate)
    }

    const setYear = ({ startDate, activationDate }: { startDate: Date, activationDate?: Date }): DateRangeWithPreset => {
      const effectiveDateRange = getDateRange({ mode: 'year', endDate: startDate })
      return setDateRangeWithDerivedPreset(effectiveDateRange, activationDate)
    }

    const setMonthByPeriod = (
      { monthNumber, yearNumber, activationDate }: { monthNumber: number, yearNumber: number, activationDate?: Date },
    ): DateRangeWithPreset => {
      const monthIndex = Math.min(Math.max(monthNumber, 1), 12) - 1
      const firstDayOfMonth = new Date(yearNumber, monthIndex, 1)
      return setMonth({ startDate: firstDayOfMonth, activationDate })
    }

    const setDatePreset = (
      { datePreset, activationDate }: { datePreset: SelectableDatePreset, activationDate?: Date },
    ): DateRangeWithPreset => {
      const derivedDateRange = deriveDateRangeFromPreset(datePreset, activationDate)
      // No-op while the activation date is still loading
      if (derivedDateRange === null) return { ...get() }
      return setDateRangeWithPreset(getDateRange({ mode: 'full', ...derivedDateRange }), datePreset)
    }

    return {
      ...getDateRange({ mode: 'full', ...initialRange }),
      preset: initialPreset,

      actions: {
        setDate,
        setDateRange,
        setMonth,
        setYear,
        setMonthByPeriod,
        setDatePreset,
      },
    }
  })
}
