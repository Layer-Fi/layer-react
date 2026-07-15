import { createStore } from 'zustand'

import type { DateRange } from '@utils/date/dateRange'
import { type DatePreset, deriveDateRangeFromPreset, derivePresetFromDateRange, type SelectableDatePreset } from '@utils/date/dateRangePresets'
import { correctDateRange, getDateRange } from '@providers/DateStoreProvider/internal/dateStoreUtils'
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

    const setDateRange = (options: { startDate: Date, endDate: Date }, activationDate?: Date): DateRangeWithPreset => {
      const dateRangeToApply = getDateRange({ mode: 'full', ...correctDateRange(options) })
      return setDateRangeWithDerivedPreset(dateRangeToApply, activationDate)
    }

    const setDate = ({ date }: { date: Date }, activationDate?: Date): DateRangeWithPreset => {
      const startOfMonth = getDateRange({ mode: 'month', endDate: date }).startDate
      const endDateClamped = getDateRange({ mode: 'full', startDate: date, endDate: date }).endDate

      const dateRangeToApply = {
        startDate: startOfMonth,
        endDate: endDateClamped,
      }

      return setDateRangeWithDerivedPreset(dateRangeToApply, activationDate)
    }

    const setMonth = ({ startDate }: { startDate: Date }, activationDate?: Date): DateRangeWithPreset => {
      const dateRangeToApply = getDateRange({ mode: 'month', endDate: startDate })
      return setDateRangeWithDerivedPreset(dateRangeToApply, activationDate)
    }

    const setYear = ({ startDate }: { startDate: Date }, activationDate?: Date): DateRangeWithPreset => {
      const dateRangeToApply = getDateRange({ mode: 'year', endDate: startDate })
      return setDateRangeWithDerivedPreset(dateRangeToApply, activationDate)
    }

    const setMonthByPeriod = ({ monthNumber, yearNumber }: { monthNumber: number, yearNumber: number }, activationDate?: Date): DateRangeWithPreset => {
      const monthIndex = Math.min(Math.max(monthNumber, 1), 12) - 1
      const firstDayOrMonth = new Date(yearNumber, monthIndex, 1)
      const dateRangeToApply = getDateRange({ mode: 'month', endDate: firstDayOrMonth })
      return setDateRangeWithDerivedPreset(dateRangeToApply, activationDate)
    }

    const setDatePreset = (
      { datePreset }: { datePreset: SelectableDatePreset },
      activationDate?: Date,
    ): DateRangeWithPreset => {
      const resolvedDateRange = deriveDateRangeFromPreset(datePreset, activationDate)
      // If the resolved date range is null, the business activation time is not yet loaded in the context, so we keep the current selection and noop
      if (resolvedDateRange === null) return { ...get() }
      return setDateRangeWithPreset(getDateRange({ mode: 'full', ...resolvedDateRange }), datePreset)
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
