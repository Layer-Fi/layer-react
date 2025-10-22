import {
  endOfDay,
  endOfMonth,
  endOfYear,
  min,
  max,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import { useState, createContext, type PropsWithChildren, useContext, useMemo } from 'react'
import { createStore, useStore } from 'zustand'
import { unsafeAssertUnreachable } from '../../utils/switch/assertUnreachable'
import { useStoreWithDateSelected } from '../../utils/zustand/useStoreWithDateSelected'
import type { UnifiedPickerMode } from '../../components/DeprecatedDatePicker/ModeSelector/DeprecatedDatePickerModeSelector'

const _DATE_PICKER_MODES = [
  'dayPicker',
] as const
export type DatePickerMode = typeof _DATE_PICKER_MODES[number]

const _RANGE_PICKER_MODES = [
  'dayRangePicker',
  'monthPicker',
  'monthRangePicker',
  'yearPicker',
] as const
export type DateRangePickerMode = typeof _RANGE_PICKER_MODES[number]

export const isDateRangePickerMode = (mode: string): mode is DateRangePickerMode => {
  return _RANGE_PICKER_MODES.includes(mode as DateRangePickerMode)
}

export function clampToAfterActivationDate(date: Date | number, activationDate: Date) {
  return max([date, activationDate])
}

export function clampToPresentOrPast(date: Date | number, cutoff = endOfDay(new Date())) {
  return min([date, cutoff])
}

const RANGE_MODE_LOOKUP = {
  dayPicker: {
    getStartDate: ({ startDate }: { startDate: Date }) => startOfMonth(startDate),
    getEndDate: ({ endDate }: { endDate: Date }) => clampToPresentOrPast(endOfDay(endDate)),
  },
  dayRangePicker: {
    getStartDate: ({ startDate }: { startDate: Date }) => startDate,
    getEndDate: ({ endDate }: { endDate: Date }) => clampToPresentOrPast(endOfDay(endDate)),
  },
  monthPicker: {
    getStartDate: ({ startDate }: { startDate: Date }) => startOfMonth(startDate),
    getEndDate: ({ endDate }: { endDate: Date }) => clampToPresentOrPast(endOfMonth(endDate)),
  },
  monthRangePicker: {
    getStartDate: ({ startDate }: { startDate: Date }) => startOfMonth(startDate),
    getEndDate: ({ endDate }: { endDate: Date }) => clampToPresentOrPast(endOfMonth(endDate)),
  },
  yearPicker: {
    getStartDate: ({ startDate }: { startDate: Date }) => startOfYear(startDate),
    getEndDate: ({ endDate }: { endDate: Date }) => clampToPresentOrPast(endOfYear(endDate)),
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
  setMonthRange: (options: { startDate: Date, endDate: Date }) => DateRange
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
      const s = RANGE_MODE_LOOKUP.dayPicker.getStartDate({ startDate: date })
      const e = RANGE_MODE_LOOKUP.dayPicker.getEndDate({ endDate: date })
      return apply({ startDate: s, endDate: e })
    }

    const setDateRange = withCorrectedRange(({ startDate, endDate }): DateRange => {
      const s = RANGE_MODE_LOOKUP.dayRangePicker.getStartDate({ startDate })
      const e = RANGE_MODE_LOOKUP.dayRangePicker.getEndDate({ endDate })
      return apply({ startDate: s, endDate: e })
    })

    const setMonth = ({ startDate }: { startDate: Date }): DateRange => {
      const s = RANGE_MODE_LOOKUP.monthPicker.getStartDate({ startDate })
      const e = RANGE_MODE_LOOKUP.monthPicker.getEndDate({ endDate: startDate })
      return apply({ startDate: s, endDate: e })
    }

    const setMonthRange = withCorrectedRange(({ startDate, endDate }): DateRange => {
      const s = RANGE_MODE_LOOKUP.monthRangePicker.getStartDate({ startDate })
      const e = RANGE_MODE_LOOKUP.monthRangePicker.getEndDate({ endDate })
      return apply({ startDate: s, endDate: e })
    })

    const setYear = ({ startDate }: { startDate: Date }): DateRange => {
      const s = RANGE_MODE_LOOKUP.yearPicker.getStartDate({ startDate })
      const e = RANGE_MODE_LOOKUP.yearPicker.getEndDate({ endDate: startDate })
      return apply({ startDate: s, endDate: e })
    }

    const setRangeWithExplicitDisplayMode = ({
      startDate,
      endDate,
      displayMode,
    }: { startDate: Date, endDate: Date, displayMode: UnifiedPickerMode }): DateRange => {
      switch (displayMode) {
        case 'dayPicker':
          return setDate({ date: endDate })
        case 'dayRangePicker':
          return setDateRange({ startDate, endDate })
        case 'monthPicker':
          return setMonth({ startDate })
        case 'monthRangePicker':
          return setMonthRange({ startDate, endDate })
        case 'yearPicker':
          return setYear({ startDate })
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
        setMonthRange,
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
  const setMonthRange = useStore(store, ({ actions: { setMonthRange } }) => setMonthRange)
  const setYear = useStore(store, ({ actions: { setYear } }) => setYear)

  return {
    setRangeWithExplicitDisplayMode,
    setDateRange,
    setMonth,
    setMonthRange,
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
