import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import {
  endOfDay,
  endOfMonth,
  max,
  min,
  startOfMonth,
} from 'date-fns'
import { createStore, useStore } from 'zustand'

import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { useStoreWithDateSelected } from '@utils/zustand/useStoreWithDateSelected'

export type DateRangePickerMode = 'full' | 'month'
export type DatePickerMode = 'date'
export type UnifiedPickerMode = DateRangePickerMode | DatePickerMode

export function clampToAfterActivationDate(date: Date | number, activationDate: Date) {
  return max([date, activationDate])
}

export function clampToPresentOrPast(date: Date | number, cutoff = endOfDay(new Date())) {
  return min([date, cutoff])
}

const RANGE_MODE_LOOKUP = {
  date: {
    getStartDate: ({ startDate }: { startDate: Date }) => startOfMonth(startDate),
    getEndDate: ({ endDate }: { endDate: Date }) => clampToPresentOrPast(endOfDay(endDate)),
  },
  full: {
    getStartDate: ({ startDate }: { startDate: Date }) => startDate,
    getEndDate: ({ endDate }: { endDate: Date }) => clampToPresentOrPast(endOfDay(endDate)),
  },
  month: {
    getStartDate: ({ startDate }: { startDate: Date }) => startOfMonth(startDate),
    getEndDate: ({ endDate }: { endDate: Date }) => clampToPresentOrPast(endOfMonth(endDate)),
  },
} satisfies Record<
  UnifiedPickerMode,
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
  setRangeWithExplicitDisplayMode: (
    options: {
      startDate: Date
      endDate: Date
      displayMode: UnifiedPickerMode
    }
  ) => DateRange

  setDate: (options: { date: Date }) => DateRange
  setDateRange: (options: { startDate: Date, endDate: Date }) => DateRange
  setMonth: (options: { startDate: Date }) => DateRange

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
      const s = RANGE_MODE_LOOKUP.date.getStartDate({ startDate: date })
      const e = RANGE_MODE_LOOKUP.date.getEndDate({ endDate: date })
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

    const setRangeWithExplicitDisplayMode = ({
      startDate,
      endDate,
      displayMode,
    }: { startDate: Date, endDate: Date, displayMode: UnifiedPickerMode }): DateRange => {
      switch (displayMode) {
        case 'date':
          return setDate({ date: endDate })
        case 'full':
          return setDateRange({ startDate, endDate })
        case 'month':
          return setMonth({ startDate })
        default:
          unsafeAssertUnreachable({
            value: displayMode,
            message: 'Invalid `displayMode`',
          })
      }
    }
    return {
      startDate: startOfMonth(now),
      endDate: clampToPresentOrPast(endOfMonth(now)),

      actions: {
        setDate,
        setRangeWithExplicitDisplayMode,
        setDateRange,
        setMonth,

        setMonthByPeriod: ({ monthNumber, yearNumber }) => {
          const effectiveMonthNumber = Math.min(Math.max(monthNumber, 1), 12)

          return setMonth({ startDate: new Date(yearNumber, effectiveMonthNumber - 1, 1) })
        },
      },
    }
  })
}

const GlobalDateStoreContext = createContext(buildStore())

export function useGlobalDate() {
  const store = useContext(GlobalDateStoreContext)

  const date = useStoreWithDateSelected(store, ({ endDate }) => endDate)

  return { date }
}

export function useGlobalDateActions() {
  const store = useContext(GlobalDateStoreContext)

  const setDate = useStore(store, ({ actions: { setDate } }) => setDate)

  return { setDate }
}

const getEffectiveDateRangeForMode = (
  mode: DateRangePickerMode,
  { startDate, endDate }: { startDate: Date, endDate: Date },
): { startDate: Date, endDate: Date } => {
  const rangeModifierForMode = RANGE_MODE_LOOKUP[mode]
  return {
    startDate: rangeModifierForMode.getStartDate({ startDate }),
    endDate: rangeModifierForMode.getEndDate({ endDate }),
  }
}

export function useGlobalDateRange({ displayMode }: { displayMode: DateRangePickerMode }) {
  const store = useContext(GlobalDateStoreContext)

  const rawStartDate = useStoreWithDateSelected(store, ({ startDate }) => startDate)
  const rawEndDate = useStoreWithDateSelected(store, ({ endDate }) => endDate)

  return useMemo(
    () => getEffectiveDateRangeForMode(
      displayMode,
      { startDate: rawStartDate, endDate: rawEndDate },
    ), [displayMode, rawEndDate, rawStartDate],
  )
}

export function useGlobalDateRangeActions() {
  const store = useContext(GlobalDateStoreContext)

  const setRangeWithExplicitDisplayMode = useStore(
    store,
    ({ actions: { setRangeWithExplicitDisplayMode } }) => setRangeWithExplicitDisplayMode,
  )

  const setDateRange = useStore(store, ({ actions: { setDateRange } }) => setDateRange)
  const setMonth = useStore(store, ({ actions: { setMonth } }) => setMonth)

  return {
    setRangeWithExplicitDisplayMode,
    setDateRange,
    setMonth,
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
