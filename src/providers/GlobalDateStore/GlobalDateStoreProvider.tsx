import {
  endOfMonth,
  startOfMonth,
} from 'date-fns'
import { useState, createContext, type PropsWithChildren, useContext } from 'react'
import { createStore, useStore } from 'zustand'
import { useStoreWithDateSelected } from '../../utils/zustand/useStoreWithDateSelected'
import { DateState } from '../../types'

const _DATE_PICKER_MODES = [
  'dayPicker',
] as const
export type DayDatePickerMode = typeof _DATE_PICKER_MODES[number]

const _RANGE_PICKER_MODES = [
  'dayRangePicker',
  'monthPicker',
  'monthRangePicker',
  'yearPicker',
] as const
export type DateRangePickerMode = typeof _RANGE_PICKER_MODES[number]

export type DatePickerMode = DayDatePickerMode | DateRangePickerMode

// function startOfNextDay(date: Date | number) {
//   return startOfDay(addDays(date, 1))
// }

// function clampToPresentOrPast(date: Date | number, cutoff = endOfDay(new Date())) {
//   return min([date, cutoff])
// }

// type CommonShiftOptions = { currentStart: Date }
// type PreShiftOptions = CommonShiftOptions & { currentEnd: Date, newEnd: Date }
// type PostShiftOptions = CommonShiftOptions & { shiftedCurrentEnd: Date, shiftedNewEnd: Date }

// function withShiftedEnd<T>(fn: (options: PostShiftOptions) => T) {
//   return ({ currentStart, currentEnd, newEnd }: PreShiftOptions) => {
//     const shiftedCurrentEnd = startOfNextDay(currentEnd)
//  const shiftedNewEnd = clampToPresentOrPast(startOfNextDay(newEnd), startOfNextDay(new Date()))

//     return fn({ currentStart, shiftedCurrentEnd, shiftedNewEnd })
//   }
// }

type GlobalDateStoreShape = {
  startDate: DateState['startDate']
  endDate: DateState['endDate']
  mode: DateState['mode']

  actions: {
    setDate: (options: { date: Partial<DateState> }) => void
  }
}

function buildStore() {
  const now = new Date()

  return createStore<GlobalDateStoreShape>((set) => {
    return {
      startDate: startOfMonth(now),
      // end: clampToPresentOrPast(endOfMonth(now)),
      endDate: endOfMonth(now),

      mode: 'monthPicker',

      actions: {
        setDate: ({ date }) => {
          set(({
            mode: currentDisplayMode,
          }) => {
            return {
              ...date,
              mode: date.mode ?? currentDisplayMode,
            }
          })
        },
      },
    }
  })
}

const GlobalDateStoreContext = createContext(buildStore())

export function useGlobalDate() {
  const store = useContext(GlobalDateStoreContext)

  const startDate = useStoreWithDateSelected(store, ({ startDate }) => startDate)
  const endDate = useStoreWithDateSelected(store, ({ endDate }) => endDate)

  const mode = useStore(store, ({ mode }) => mode)

  return { startDate, endDate, mode }
}

export function useGlobalDateActions() {
  const store = useContext(GlobalDateStoreContext)

  const setDate = useStore(store, ({ actions: { setDate } }) => setDate)

  return { setDate }
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
