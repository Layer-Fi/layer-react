import {
  addDays,
  differenceInDays,
  differenceInMonths,
  endOfDay,
  endOfMonth,
  endOfYear,
  min,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns'
import { useState, createContext, type PropsWithChildren, useContext } from 'react'
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

function clampToPresentOrPast(date: Date | number, cutoff = endOfDay(new Date())) {
  return min([date, cutoff])
}

type CommonShiftOptions = { currentStart: Date }
type PreShiftOptions = CommonShiftOptions & { currentEnd: Date, newEnd: Date }
type PostShiftOptions = CommonShiftOptions & { shiftedCurrentEnd: Date, shiftedNewEnd: Date }

function withShiftedEnd<T>(fn: (options: PostShiftOptions) => T) {
  return ({ currentStart, currentEnd, newEnd }: PreShiftOptions) => {
    const shiftedCurrentEnd = startOfNextDay(currentEnd)
    const shiftedNewEnd = clampToPresentOrPast(startOfNextDay(newEnd), startOfNextDay(new Date()))

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
    getEnd: ({ end }: { end: Date }) => clampToPresentOrPast(endOfDay(end)),
  },
  monthPicker: {
    getStart: ({ start }: { start: Date }) => startOfMonth(start),
    getShiftedStart: withShiftedEnd(({ shiftedNewEnd }) => {
      return subMonths(shiftedNewEnd, 1)
    }),
    getEnd: ({ end }: { end: Date }) => clampToPresentOrPast(endOfMonth(end)),
  },
  monthRangePicker: {
    getStart: ({ start }: { start: Date }) => startOfMonth(start),
    getShiftedStart: withShiftedEnd(({ currentStart, shiftedCurrentEnd, shiftedNewEnd }) => {
      const fullMonthCount = differenceInMonths(shiftedCurrentEnd, currentStart)
      return subMonths(shiftedNewEnd, fullMonthCount)
    }),
    getEnd: ({ end }: { end: Date }) => clampToPresentOrPast(endOfMonth(end)),
  },
  yearPicker: {
    getStart: ({ start }: { start: Date }) => startOfYear(start),
    getShiftedStart: withShiftedEnd(({ shiftedNewEnd }) => {
      return subYears(shiftedNewEnd, 1)
    }),
    getEnd: ({ end }: { end: Date }) => clampToPresentOrPast(endOfYear(end)),
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

type GlobalDateState = {
  start: Date
  end: Date

  displayMode: DatePickerMode
  rangeDisplayMode: DateRangePickerMode
}

type GlobalDateActions = {
  set: (options: { date: Date }) => void

  setRange: (options: { start: Date, end: Date }) => void
  setRangeDisplayMode: (options: { rangeDisplayMode: DateRangePickerMode }) => void
  setRangeWithExplicitDisplayMode: (
    options: {
      start: Date
      end: Date
      rangeDisplayMode: DateRangePickerMode
    }
  ) => void
  setMonth: (options: { start: Date }) => void
  setMonthRange: (options: { start: Date, end: Date }) => void
  setYear: (options: { start: Date }) => void

  setMonthByPeriod: (options: { monthNumber: number, yearNumber: number }) => void
}

type GlobalDateStore = GlobalDateState & { actions: GlobalDateActions }

function buildStore() {
  const now = new Date()

  return createStore<GlobalDateStore>((set, get) => {
    const setRange = withCorrectedRange(({ start, end }) => {
      set({
        start: RANGE_MODE_LOOKUP.dayRangePicker.getStart({ start }),
        end: RANGE_MODE_LOOKUP.dayRangePicker.getEnd({ end }),
        rangeDisplayMode: 'dayRangePicker',
      })
    })
    const setMonth = ({ start }: { start: Date }) => {
      set({
        start: RANGE_MODE_LOOKUP.monthPicker.getStart({ start }),
        end: RANGE_MODE_LOOKUP.monthPicker.getEnd({ end: start }),
        rangeDisplayMode: 'monthPicker',
      })
    }
    const setMonthRange = withCorrectedRange(({ start, end }) => {
      set({
        start: RANGE_MODE_LOOKUP.monthRangePicker.getStart({ start }),
        end: RANGE_MODE_LOOKUP.monthRangePicker.getEnd({ end }),
        rangeDisplayMode: 'monthRangePicker',
      })
    })
    const setYear = ({ start }: { start: Date }) => {
      set({
        start: RANGE_MODE_LOOKUP.yearPicker.getStart({ start }),
        end: RANGE_MODE_LOOKUP.yearPicker.getEnd({ end: start }),
        rangeDisplayMode: 'yearPicker',
      })
    }

    const setRangeWithExplicitDisplayMode = ({
      start,
      end,
      rangeDisplayMode,
    }: { start: Date, end: Date, rangeDisplayMode: DateRangePickerMode }) => {
      switch (rangeDisplayMode) {
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
          safeAssertUnreachable(rangeDisplayMode, 'Invalid range displayMode')
      }
    }

    return {
      start: startOfMonth(now),
      end: clampToPresentOrPast(endOfMonth(now)),

      displayMode: 'dayPicker',
      rangeDisplayMode: 'monthPicker',

      actions: {
        set: ({ date }) => {
          set(({
            start: currentStart,
            end: currentEnd,
            rangeDisplayMode: currentRangeDisplayMode,
          }) => {
            const newEnd = RANGE_MODE_LOOKUP.dayRangePicker.getEnd({ end: date })

            return {
              start: RANGE_MODE_LOOKUP[currentRangeDisplayMode].getShiftedStart({
                currentStart,
                currentEnd,
                newEnd,
              }),
              end: newEnd,
              rangeDisplayMode: 'dayRangePicker',
            }
          })
        },
        setRange,
        setRangeDisplayMode: ({ rangeDisplayMode }) => {
          const { start, end } = get()

          setRangeWithExplicitDisplayMode({ rangeDisplayMode, start, end })
        },
        setRangeWithExplicitDisplayMode,
        setMonth,
        setMonthRange,
        setYear,

        setMonthByPeriod: ({ monthNumber, yearNumber }) => {
          const effectiveMonthNumber = Math.min(Math.max(monthNumber, 1), 12)

          setMonth({ start: new Date(yearNumber, effectiveMonthNumber - 1, 1) })
        },
      },
    }
  })
}

const GlobalDateStoreContext = createContext(buildStore())

export function useGlobalDate() {
  const store = useContext(GlobalDateStoreContext)

  const date = useStoreWithDateSelected(store, ({ end }) => end)

  const displayMode = useStore(store, ({ displayMode }) => displayMode)

  return { date, displayMode }
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

  const rangeDisplayMode = useStore(store, ({ rangeDisplayMode }) => rangeDisplayMode)

  return {
    start,
    end,
    rangeDisplayMode,
  }
}

export function useGlobalDateRangeActions() {
  const store = useContext(GlobalDateStoreContext)

  const setRange = useStore(store, ({ actions: { setRange } }) => setRange)
  const setRangeDisplayMode = useStore(
    store,
    ({ actions: { setRangeDisplayMode } }) => setRangeDisplayMode,
  )
  const setRangeWithExplicitDisplayMode = useStore(
    store,
    ({ actions: { setRangeWithExplicitDisplayMode } }) => setRangeWithExplicitDisplayMode,
  )
  const setMonth = useStore(store, ({ actions: { setMonth } }) => setMonth)
  const setMonthRange = useStore(store, ({ actions: { setMonthRange } }) => setMonthRange)
  const setYear = useStore(store, ({ actions: { setYear } }) => setYear)

  return {
    setRange,
    setRangeDisplayMode,
    setRangeWithExplicitDisplayMode,
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
