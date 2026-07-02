import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'
import { createStore, useStore } from 'zustand'

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
  // Evaluated at store creation (not module import) so late-mounted
  // providers initialize relative to the current date.
  const { startDate, endDate } = rangeForPreset(initialDatePreset)
  return getDateRange({ mode: 'full', startDate, endDate })
}

function buildDateStore(options: MakeDateStoreOptions) {
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
      ...resolveInitialRange(options),

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
  const createStoreInstance = () => buildDateStore(options)
  const DateStoreContext = createContext(createStoreInstance())

  function useDate({ dateSelectionMode = 'full' }: { dateSelectionMode?: DateSelectionMode } = {}) {
    const store = useContext(DateStoreContext)

    const rawDate = useStoreWithDateSelected(store, ({ endDate }) => endDate)

    return useMemo(
      () => getEffectiveDateForMode(dateSelectionMode, { date: rawDate }),
      [dateSelectionMode, rawDate],
    )
  }

  function useDateActions() {
    const store = useContext(DateStoreContext)

    const setDate = useStore(store, ({ actions: { setDate } }) => setDate)

    return { setDate }
  }

  function useDateRange({ dateSelectionMode }: { dateSelectionMode: DateSelectionMode }) {
    const store = useContext(DateStoreContext)

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
    const store = useContext(DateStoreContext)

    const setDateRange = useStore(store, ({ actions: { setDateRange } }) => setDateRange)
    const setMonth = useStore(store, ({ actions: { setMonth } }) => setMonth)
    const setYear = useStore(store, ({ actions: { setYear } }) => setYear)

    return {
      setDateRange,
      setMonth,
      setYear,
    }
  }

  function usePeriodAlignedActions() {
    const store = useContext(DateStoreContext)

    const setMonthByPeriod = useStore(store, ({ actions: { setMonthByPeriod } }) => setMonthByPeriod)

    return { setMonthByPeriod }
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
