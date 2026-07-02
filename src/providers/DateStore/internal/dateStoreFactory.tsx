import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'
import { createStore, type StoreApi, useStore } from 'zustand'

import { useStoreWithDateSelected } from '@utils/zustand/useStoreWithDateSelected'
import {
  getDateRange,
  getEffectiveDateForMode,
  getEffectiveDateRangeForMode,
  withCorrectedRange,
} from '@providers/DateStore/internal/dateStoreUtils'
import type { DateRange, DateSelectionMode, DateStore } from '@providers/DateStore/internal/types'
import { DatePreset, rangeForPreset } from '@components/DateSelection/utils'

export type MakeDateStoreOptions = {
  initialDatePreset?: Exclude<DatePreset, DatePreset.Custom>
}

function resolveInitialRange({
  initialDatePreset = DatePreset.ThisMonth,
}: MakeDateStoreOptions): DateRange {
  const { startDate, endDate } = rangeForPreset(initialDatePreset)
  return getDateRange({ mode: 'full', startDate, endDate })
}

/*
 * The sentinel range is only used for the fallback provider for date store hooks rendered outside an official provider.
 * A date control instantiated with January 1970 (the unix epoch) is the signature of a date store hook rendered outside its provider.
 */
export const FALLBACK_SENTINEL_RANGE: DateRange = {
  startDate: new Date(1970, 0, 1),
  endDate: new Date(1970, 0, 31, 23, 59, 59, 999),
}

function buildDateStore(initialRange: DateRange) {
  return createStore<DateStore>((set) => {
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
      ...initialRange,

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

export function makeDateStore(options: MakeDateStoreOptions = {}) {
  const createStoreInstance = () => buildDateStore(resolveInitialRange(options))
  const DateStoreContext = createContext<StoreApi<DateStore> | null>(null)

  const fallbackStore = buildDateStore(FALLBACK_SENTINEL_RANGE)
  let hasWarnedAboutMissingProvider = false

  function useDateStore() {
    const store = useContext(DateStoreContext)
    if (store !== null) return store

    if (!hasWarnedAboutMissingProvider) {
      hasWarnedAboutMissingProvider = true
      console.warn('A date store hook was used outside its provider. Dates will display as January 1970.')
    }

    return fallbackStore
  }

  function useDate({ dateSelectionMode = 'full' }: { dateSelectionMode?: DateSelectionMode } = {}) {
    const store = useDateStore()

    const rawDate = useStoreWithDateSelected(store, ({ endDate }) => endDate)

    return useMemo(
      () => getEffectiveDateForMode(dateSelectionMode, { date: rawDate }),
      [dateSelectionMode, rawDate],
    )
  }

  function useDateActions() {
    const store = useDateStore()

    const setDate = useStore(store, ({ actions }) => actions.setDate)

    return useMemo(() => ({ setDate }), [setDate])
  }

  function useDateRange({ dateSelectionMode }: { dateSelectionMode: DateSelectionMode }) {
    const store = useDateStore()

    const rawStartDate = useStoreWithDateSelected(store, ({ startDate }) => startDate)
    const rawEndDate = useStoreWithDateSelected(store, ({ endDate }) => endDate)

    return useMemo(
      () => getEffectiveDateRangeForMode(
        dateSelectionMode,
        { startDate: rawStartDate, endDate: rawEndDate },
      ), [dateSelectionMode, rawEndDate, rawStartDate],
    )
  }

  function useDateRangeActions() {
    const store = useDateStore()

    const setDateRange = useStore(store, ({ actions }) => actions.setDateRange)
    const setMonth = useStore(store, ({ actions }) => actions.setMonth)
    const setYear = useStore(store, ({ actions }) => actions.setYear)

    return useMemo(() => ({
      setDateRange,
      setMonth,
      setYear,
    }), [setDateRange, setMonth, setYear])
  }

  function usePeriodAlignedActions() {
    const store = useDateStore()

    const setMonthByPeriod = useStore(store, ({ actions }) => actions.setMonthByPeriod)

    return useMemo(() => ({ setMonthByPeriod }), [setMonthByPeriod])
  }

  function Provider({ children }: PropsWithChildren) {
    const [store] = useState(createStoreInstance)

    return (
      <DateStoreContext.Provider value={store}>
        {children}
      </DateStoreContext.Provider>
    )
  }

  return {
    Provider,
    useDate,
    useDateActions,
    useDateRange,
    useDateRangeActions,
    usePeriodAlignedActions,
  }
}
