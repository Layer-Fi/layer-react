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
import { safeAssertUnreachable } from '../../utils/switch/assertUnreachable'
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

export const isDateRangePickerMode = (mode: string): mode is DateRangePickerMode => {
  return _RANGE_PICKER_MODES.includes(mode as DateRangePickerMode)
}

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
}

type GlobalDateActions = {
  setDate: (options: { date: Date }) => void

  setDateRange: (options: { start: Date, end: Date }) => void
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

  return createStore<GlobalDateStore>((set) => {
    const setDateRange = withCorrectedRange(({ start, end }) => {
      set({
        start: RANGE_MODE_LOOKUP.dayRangePicker.getStart({ start }),
        end: RANGE_MODE_LOOKUP.dayRangePicker.getEnd({ end }),
      })
    })
    const setMonth = ({ start }: { start: Date }) => {
      set({
        start: RANGE_MODE_LOOKUP.monthPicker.getStart({ start }),
        end: RANGE_MODE_LOOKUP.monthPicker.getEnd({ end: start }),
      })
    }
    const setMonthRange = withCorrectedRange(({ start, end }) => {
      set({
        start: RANGE_MODE_LOOKUP.monthRangePicker.getStart({ start }),
        end: RANGE_MODE_LOOKUP.monthRangePicker.getEnd({ end }),
      })
    })
    const setYear = ({ start }: { start: Date }) => {
      set({
        start: RANGE_MODE_LOOKUP.yearPicker.getStart({ start }),
        end: RANGE_MODE_LOOKUP.yearPicker.getEnd({ end: start }),
      })
    }

    const setRangeWithExplicitDisplayMode = ({
      start,
      end,
      rangeDisplayMode,
    }: { start: Date, end: Date, rangeDisplayMode: DateRangePickerMode }) => {
      switch (rangeDisplayMode) {
        case 'dayRangePicker':
          setDateRange({ start, end })
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
          safeAssertUnreachable({
            value: rangeDisplayMode,
            message: 'Invalid `rangeDisplayMode`',
          })
      }
    }

    return {
      start: startOfMonth(now),
      end: clampToPresentOrPast(endOfMonth(now)),

      actions: {
        setDate: ({ date }) => {
          set(({
            start: currentStart,
            end: currentEnd,
          }) => {
            const newEnd = RANGE_MODE_LOOKUP.dayRangePicker.getEnd({ end: date })

            return {
              start: RANGE_MODE_LOOKUP.dayRangePicker.getShiftedStart({
                currentStart,
                currentEnd,
                newEnd,
              }),
              end: newEnd,
            }
          })
        },
        setRangeWithExplicitDisplayMode,
        setDateRange,
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

  return { date }
}

export function useGlobalDateActions() {
  const store = useContext(GlobalDateStoreContext)

  const setDate = useStore(store, ({ actions: { setDate } }) => setDate)

  return { setDate }
}

const getEffectiveDateRangeForMode = (
  mode: DateRangePickerMode,
  { start, end }: { start: Date, end: Date },
): { start: Date, end: Date } => {
  const rangeModifierForMode = RANGE_MODE_LOOKUP[mode]
  return {
    start: rangeModifierForMode.getStart({ start }),
    end: rangeModifierForMode.getEnd({ end }),
  }
}

export function useGlobalDateRange({ displayMode = 'monthPicker' }: { displayMode: DateRangePickerMode }) {
  const store = useContext(GlobalDateStoreContext)

  const rawStart = useStoreWithDateSelected(store, ({ start }) => start)
  const rawEnd = useStoreWithDateSelected(store, ({ end }) => end)

  const { start, end } = getEffectiveDateRangeForMode(displayMode, { start: rawStart, end: rawEnd })

  return {
    start,
    end,
  }
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
