import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  max,
  min,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import { createStore, useStore } from 'zustand'

import { useStoreWithDateSelected } from '@utils/zustand/useStoreWithDateSelected'

export type DateSelectionMode = 'full' | 'month' | 'year'

export function clampToAfterActivationDate(date: Date | number, activationDate: Date) {
  return max([date, activationDate])
}

export function clampToPresentOrPast(date: Date | number, cutoff = endOfDay(new Date())) {
  return min([date, cutoff])
}

const RANGE_MODE_LOOKUP = {
  full: {
    getStartDate: ({ startDate }: { startDate: Date }) => startDate,
    getEndDate: ({ endDate }: { endDate: Date }) => clampToPresentOrPast(endOfDay(endDate)),
  },
  month: {
    getStartDate: ({ startDate }: { startDate: Date }) => startOfMonth(startDate),
    getEndDate: ({ endDate }: { endDate: Date }) => clampToPresentOrPast(endOfMonth(endDate)),
  },
  year: {
    getStartDate: ({ startDate }: { startDate: Date }) => startOfYear(startDate),
    getEndDate: ({ endDate }: { endDate: Date }) => clampToPresentOrPast(endOfYear(endDate)),
  },
} satisfies Record<
  DateSelectionMode,
  {
    getStartDate: ({ startDate }: { startDate: Date }) => Date
    getEndDate: ({ endDate }: { endDate: Date }) => Date
  }
>

export type DateRange = { startDate: Date, endDate: Date }

function withCorrectedRange<TDateRange extends DateRange, TOut>(fn: (options: TDateRange) => TOut) {
  return (options: TDateRange) => {
    const { startDate, endDate } = options

    if (startDate > endDate) {
      return fn({ ...options, startDate: endDate, endDate: startDate })
    }

    return fn({ ...options, startDate, endDate })
  }
}

export type GlobalDateState = DateRange

type GlobalDateActions = {
  setDate: (options: { date: Date }) => DateRange
  setDateRange: (options: { startDate: Date, endDate: Date }) => DateRange
  setMonth: (options: { startDate: Date }) => DateRange
  setYear: (options: { startDate: Date }) => DateRange

  setMonthByPeriod: (options: { monthNumber: number, yearNumber: number }) => DateRange
}

type GlobalDateStore = GlobalDateState & { actions: GlobalDateActions }

function buildStore() {
  const now = new Date()

  return createStore<GlobalDateStore>((set) => {
    const apply = (next: DateRange): DateRange => {
      set(next)
      return next
    }

    const setDate = ({ date }: { date: Date }): DateRange => {
      // Always clamp to start of month for date.
      const s = RANGE_MODE_LOOKUP.month.getStartDate({ startDate: date })
      const e = RANGE_MODE_LOOKUP.full.getEndDate({ endDate: date })
      return apply({ startDate: s, endDate: e })
    }

    const setDateRange = withCorrectedRange(({ startDate, endDate }): DateRange => {
      const s = RANGE_MODE_LOOKUP.full.getStartDate({ startDate })
      const e = RANGE_MODE_LOOKUP.full.getEndDate({ endDate })
      return apply({ startDate: s, endDate: e })
    })

    const setMonth = ({ startDate }: { startDate: Date }): DateRange => {
      const s = RANGE_MODE_LOOKUP.month.getStartDate({ startDate })
      const e = RANGE_MODE_LOOKUP.month.getEndDate({ endDate: startDate })
      return apply({ startDate: s, endDate: e })
    }

    const setYear = ({ startDate }: { startDate: Date }): DateRange => {
      const s = RANGE_MODE_LOOKUP.year.getStartDate({ startDate })
      const e = RANGE_MODE_LOOKUP.year.getEndDate({ endDate: startDate })
      return apply({ startDate: s, endDate: e })
    }

    return {
      startDate: startOfMonth(now),
      endDate: clampToPresentOrPast(endOfMonth(now)),

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

const GlobalDateStoreContext = createContext(buildStore())

const getEffectiveDateForMode = (mode: DateSelectionMode, { date }: { date: Date }): { date: Date } => {
  const rangeModifierForMode = RANGE_MODE_LOOKUP[mode]
  return { date: rangeModifierForMode.getEndDate({ endDate: date }) }
}

export function useGlobalDate({ dateSelectionMode = 'full' }: { dateSelectionMode?: DateSelectionMode } = {}) {
  const store = useContext(GlobalDateStoreContext)

  const rawDate = useStoreWithDateSelected(store, ({ endDate }) => endDate)

  return useMemo(
    () => getEffectiveDateForMode(dateSelectionMode, { date: rawDate }),
    [dateSelectionMode, rawDate],
  )
}

export function useGlobalDateActions() {
  const store = useContext(GlobalDateStoreContext)

  const setDate = useStore(store, ({ actions: { setDate } }) => setDate)

  return { setDate }
}

const getEffectiveDateRangeForMode = (
  mode: DateSelectionMode,
  { startDate, endDate }: { startDate: Date, endDate: Date },
): { startDate: Date, endDate: Date } => {
  const rangeModifierForMode = RANGE_MODE_LOOKUP[mode]
  return {
    startDate: rangeModifierForMode.getStartDate({ startDate }),
    endDate: rangeModifierForMode.getEndDate({ endDate }),
  }
}

export function useGlobalDateRange({ dateSelectionMode }: { dateSelectionMode: DateSelectionMode }) {
  const store = useContext(GlobalDateStoreContext)

  const rawStartDate = useStoreWithDateSelected(store, ({ startDate }) => startDate)
  const rawEndDate = useStoreWithDateSelected(store, ({ endDate }) => endDate)

  return useMemo(
    () => getEffectiveDateRangeForMode(
      dateSelectionMode,
      { startDate: rawStartDate, endDate: rawEndDate },
    ), [dateSelectionMode, rawEndDate, rawStartDate],
  )
}

export function useGlobalDateRangeActions() {
  const store = useContext(GlobalDateStoreContext)

  const setDateRange = useStore(store, ({ actions: { setDateRange } }) => setDateRange)
  const setMonth = useStore(store, ({ actions: { setMonth } }) => setMonth)
  const setYear = useStore(store, ({ actions: { setYear } }) => setYear)

  return {
    setDateRange,
    setMonth,
    setYear,
  }
}

export function useGlobalDatePeriodAlignedActions() {
  const store = useContext(GlobalDateStoreContext)

  const setMonthByPeriod = useStore(store, ({ actions: { setMonthByPeriod } }) => setMonthByPeriod)

  return { setMonthByPeriod }
}

type GlobalDateStoreProviderProps = PropsWithChildren

export function GlobalDateStoreProvider({
  children,
}: GlobalDateStoreProviderProps) {
  const [store] = useState(() => buildStore())

  return (
    <GlobalDateStoreContext.Provider value={store}>
      {children}
    </GlobalDateStoreContext.Provider>
  )
}
