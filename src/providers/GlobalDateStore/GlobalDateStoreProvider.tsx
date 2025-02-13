import {
  endOfDay,
  endOfMonth,
  min,
  startOfMonth,
} from 'date-fns'
import { useState, createContext, type PropsWithChildren, useContext } from 'react'
import { createStore, useStore } from 'zustand'
import { useStoreWithDateSelected } from '../../utils/zustand/useStoreWithDateSelected'
import { DateRangeState } from '../../types'

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

function clampToPresentOrPast(date: Date | number, cutoff = endOfDay(new Date())) {
  return min([date, cutoff])
}

type GlobalDateStoreShape = {
  startDate: DateRangeState['startDate']
  endDate: DateRangeState['endDate']
  mode: DateRangeState['mode']

  actions: {
    setDate: (options: Partial<DateRangeState>) => void
  }
}

function buildStore() {
  const now = new Date()

  return createStore<GlobalDateStoreShape>((set) => {
    return {
      startDate: startOfMonth(now),
      endDate: clampToPresentOrPast(endOfMonth(now)),

      mode: 'monthPicker',

      actions: {
        setDate: ({ startDate, endDate, mode }: Partial<DateRangeState>) => {
          set(({
            mode: currentDisplayMode,
          }) => {
            /** @TODO - validate if startDate is before endDate etc. If not, ignore */
            return {
              startDate,
              endDate,
              mode: mode ?? currentDisplayMode,
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

  return { startDate, endDate, dateRange: { startDate, endDate }, mode }
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
