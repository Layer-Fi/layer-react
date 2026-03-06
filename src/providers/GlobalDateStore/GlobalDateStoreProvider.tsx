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

import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { useStoreWithDateSelected } from '@utils/zustand/useStoreWithDateSelected'

export type DateSelectionMode = 'full' | 'month' | 'year'

export function clampToAfterActivationDate(date: Date | number, activationDate: Date) {
  return max([date, activationDate])
}

export function clampToPresentOrPast(date: Date | number, cutoff = endOfDay(new Date())) {
  return min([date, cutoff])
}

export type DateRange = { startDate: Date, endDate: Date }
type GetDateRangeOptions =
  | { mode: 'full', startDate: Date, endDate: Date }
  | { mode: 'month', endDate: Date }
  | { mode: 'year', endDate: Date }

function getDateRange(options: GetDateRangeOptions): DateRange {
  const mode = options.mode
  switch (mode) {
    case 'month':
      return {
        startDate: startOfMonth(options.endDate),
        endDate: clampToPresentOrPast(endOfMonth(options.endDate)),
      }
    case 'year':
      return {
        startDate: startOfYear(options.endDate),
        endDate: clampToPresentOrPast(endOfYear(options.endDate)),
      }
    case 'full':
      return {
        startDate: options.startDate,
        endDate: clampToPresentOrPast(endOfDay(options.endDate)),
      }
    default:
      unsafeAssertUnreachable({
        value: mode,
        message: 'Invalid mode',
      })
  }
}

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
      const monthRange = getDateRange({ mode: 'month', endDate: date })
      const fullRange = getDateRange({ mode: 'full', startDate: date, endDate: date })
      return apply({ startDate: monthRange.startDate, endDate: fullRange.endDate })
    }

    const setDateRange = withCorrectedRange(({ startDate, endDate }): DateRange => {
      return apply(getDateRange({ mode: 'full', startDate, endDate }))
    })

    const setMonth = ({ startDate }: { startDate: Date }): DateRange => {
      return apply(getDateRange({ mode: 'month', endDate: startDate }))
    }

    const setYear = ({ startDate }: { startDate: Date }): DateRange => {
      return apply(getDateRange({ mode: 'year', endDate: startDate }))
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
  switch (mode) {
    case 'month':
      return { date: getDateRange({ mode, endDate: date }).endDate }
    case 'year':
      return { date: getDateRange({ mode, endDate: date }).endDate }
    case 'full':
      return { date: getDateRange({ mode, startDate: date, endDate: date }).endDate }
    default:
      unsafeAssertUnreachable({
        value: mode,
        message: 'Invalid provider',
      })
  }
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
  switch (mode) {
    case 'month':
      return getDateRange({ mode, endDate })
    case 'year':
      return getDateRange({ mode, endDate })
    case 'full':
      return getDateRange({ mode, startDate, endDate })
    default:
      unsafeAssertUnreachable({
        value: mode,
        message: 'Invalid provider',
      })
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
