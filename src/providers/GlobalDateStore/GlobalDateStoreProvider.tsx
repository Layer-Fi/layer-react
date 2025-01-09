import {
  addDays,
  differenceInDays,
  differenceInMonths,
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns'
import React, { useState, createContext, type PropsWithChildren, useContext } from 'react'
import { createStore, useStore } from 'zustand'
import { safeAssertUnreachable } from '../../utils/switch/safeAssertUnreachable'
import { useStoreWithDateSelected } from '../../utils/zustand/useStoreWithDateSelected'

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

function startOfNextDay(date: Date | number) {
  return startOfDay(addDays(date, 1))
}

type CommonShiftOptions = { currentStart: Date }
type PreShiftOptions = CommonShiftOptions & { currentEnd: Date, newEnd: Date }
type PostShiftOptions = CommonShiftOptions & { shiftedCurrentEnd: Date, shiftedNewEnd: Date }

function withShiftedEnd<T>(fn: (options: PostShiftOptions) => T) {
  return ({ currentStart, currentEnd, newEnd }: PreShiftOptions) => {
    const shiftedCurrentEnd = startOfNextDay(currentEnd)
    const shiftedNewEnd = startOfNextDay(newEnd)

    return fn({ currentStart, shiftedCurrentEnd, shiftedNewEnd })
  }
}

const RANGE_MODE_LOOKUP = {
  dayRangePicker: {
    getStart: ({ start }: { start: Date }) => start,
    getShiftedStart: withShiftedEnd(({ currentStart, shiftedCurrentEnd, shiftedNewEnd }) => {
      const fullDayCount = differenceInDays(shiftedCurrentEnd, currentStart)
      return subDays(shiftedNewEnd, fullDayCount)
    }),
    getEnd: ({ end }: { end: Date }) => end,
  },
  monthPicker: {
    getStart: ({ start }: { start: Date }) => startOfMonth(start),
    getShiftedStart: withShiftedEnd(({ shiftedNewEnd }) => {
      return subMonths(shiftedNewEnd, 1)
    }),
    getEnd: ({ end }: { end: Date }) => endOfMonth(end),
  },
  monthRangePicker: {
    getStart: ({ start }: { start: Date }) => startOfMonth(start),
    getShiftedStart: withShiftedEnd(({ currentStart, shiftedCurrentEnd, shiftedNewEnd }) => {
      const fullMonthCount = differenceInMonths(shiftedCurrentEnd, currentStart)
      return subMonths(shiftedNewEnd, fullMonthCount)
    }),
    getEnd: ({ end }: { end: Date }) => endOfMonth(end),
  },
  yearPicker: {
    getStart: ({ start }: { start: Date }) => startOfYear(start),
    getShiftedStart: withShiftedEnd(({ shiftedNewEnd }) => {
      return subYears(shiftedNewEnd, 1)
    }),
    getEnd: ({ end }: { end: Date }) => endOfYear(end),
  },
} satisfies Record<
  DateRangePickerMode,
  {
    getStart: ({ start }: { start: Date }) => Date
    getShiftedStart: (options: { currentStart: Date, currentEnd: Date, newEnd: Date }) => Date
    getEnd: ({ end }: { end: Date }) => Date
  }
>

type DateRange = { start: Date, end: Date }

function withCorrectedRange<TDateRange extends DateRange, TOut>(fn: (options: TDateRange) => TOut) {
  return (options: TDateRange) => {
    const { start, end } = options

    if (start > end) {
      return fn({ ...options, start: end, end: start })
    }

    return fn({ ...options, start, end })
  }
}

type GlobalDateStoreShape = {
  start: Date
  end: Date

  mode: DatePickerMode
  rangeMode: DateRangePickerMode

  actions: {
    set(options: { date: Date }): void

    setRange: (options: { start: Date, end: Date }) => void
    setRangeMode(options: { rangeMode: DateRangePickerMode }): void
    setRangeWithExplicitMode: (
      options: {
        start: Date
        end: Date
        rangeMode: DateRangePickerMode
      }
    ) => void
    setMonth: (options: { start: Date }) => void
    setMonthRange: (options: { start: Date, end: Date }) => void
    setYear: (options: { start: Date }) => void
  }
}

function buildStore() {
  const now = new Date()

  return createStore<GlobalDateStoreShape>((set, get) => {
    const setRange = withCorrectedRange(({ start, end }) => {
      set({
        start: startOfDay(start),
        end: endOfDay(end),
        rangeMode: 'dayRangePicker',
      })
    })
    const setMonth = ({ start }: { start: Date }) => {
      set({
        start: startOfMonth(start),
        end: endOfMonth(start),
        rangeMode: 'monthPicker',
      })
    }
    const setMonthRange = withCorrectedRange(({ start, end }) => {
      set({
        start: startOfMonth(start),
        end: endOfMonth(end),
        rangeMode: 'monthRangePicker',
      })
    })
    const setYear = ({ start }: { start: Date }) => {
      set({
        start: startOfMonth(start),
        end: endOfMonth(start),
        rangeMode: 'yearPicker',
      })
    }

    const setRangeWithExplicitMode = ({
      start,
      end,
      rangeMode,
    }: { start: Date, end: Date, rangeMode: DateRangePickerMode }) => {
      switch (rangeMode) {
        case 'dayRangePicker':
          setRange({ start, end })
          break
        case 'monthPicker':
          setMonth({ start })
          break
        case 'monthRangePicker':
          setMonthRange({ start, end })
          break
        case 'yearPicker':
          setYear({ start })
          break
        default:
          safeAssertUnreachable(rangeMode, 'Invalid range mode')
      }
    }

    return {
      start: startOfMonth(now),
      end: endOfMonth(now),

      mode: 'dayPicker',
      rangeMode: 'monthPicker',

      actions: {
        set: ({ date }) => {
          set(({ start: currentStart, end: currentEnd, rangeMode: currentRangeMode }) => {
            const newEnd = endOfDay(date)

            return {
              start: RANGE_MODE_LOOKUP[currentRangeMode].getShiftedStart({
                currentStart,
                currentEnd,
                newEnd,
              }),
              end: newEnd,
              rangeMode: 'dayRangePicker',
            }
          })
        },

        setRange,
        setRangeMode: ({ rangeMode }) => {
          const { start, end } = get()

          setRangeWithExplicitMode({ rangeMode, start, end })
        },
        setRangeWithExplicitMode,
        setMonth,
        setMonthRange,
        setYear,
      },
    }
  })
}

const GlobalDateStoreContext = createContext(buildStore())

export function useGlobalDate() {
  const store = useContext(GlobalDateStoreContext)

  const date = useStoreWithDateSelected(store, ({ end }) => end)

  const mode = useStore(store, ({ mode }) => mode)

  return { date, mode }
}

export function useGlobalDateActions() {
  const store = useContext(GlobalDateStoreContext)

  const set = useStore(store, ({ actions: { set } }) => set)

  return { set }
}

export function useGlobalDateRange() {
  const store = useContext(GlobalDateStoreContext)

  const start = useStoreWithDateSelected(store, ({ start }) => start)
  const end = useStoreWithDateSelected(store, ({ end }) => end)

  const rangeMode = useStore(store, ({ rangeMode }) => rangeMode)

  return {
    start,
    end,
    rangeMode,
  }
}

export function useGlobalDateRangeActions() {
  const store = useContext(GlobalDateStoreContext)

  const setRange = useStore(store, ({ actions: { setRange } }) => setRange)
  const setRangeMode = useStore(store, ({ actions: { setRangeMode } }) => setRangeMode)
  const setRangeWithExplicitMode = useStore(
    store,
    ({ actions: { setRangeWithExplicitMode } }) => setRangeWithExplicitMode,
  )
  const setMonth = useStore(store, ({ actions: { setMonth } }) => setMonth)
  const setMonthRange = useStore(store, ({ actions: { setMonthRange } }) => setMonthRange)
  const setYear = useStore(store, ({ actions: { setYear } }) => setYear)

  return { setRange, setRangeMode, setRangeWithExplicitMode, setMonth, setMonthRange, setYear }
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
