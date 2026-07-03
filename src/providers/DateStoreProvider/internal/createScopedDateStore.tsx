import { useMemo } from 'react'

import type { DateSelectionMode } from '@utils/date/dateRange'
import { createScopedStore } from '@utils/zustand/createScopedStore'
import { useStoreWithDateSelected } from '@utils/zustand/useStoreWithDateSelected'
import { buildDateStore, type MakeDateStoreOptions } from '@providers/DateStoreProvider/internal/buildDateStore'
import { getEffectiveDateForMode, getEffectiveDateRangeForMode } from '@providers/DateStoreProvider/internal/dateStoreUtils'

type DateStoreApi = ReturnType<typeof buildDateStore>

export type CreateScopedDateStoreOptions = MakeDateStoreOptions & {
  storeName?: string
}

type UseDateParams = {
  dateSelectionMode?: DateSelectionMode
}

type UseDateRangeParams = {
  dateSelectionMode: DateSelectionMode
}

export function createScopedDateStore({
  storeName = 'DateStore',
  ...dateStoreOptions
}: CreateScopedDateStoreOptions = {}) {
  const scopedStore = createScopedStore<DateStoreApi>({
    createStore: () => buildDateStore(dateStoreOptions),
    storeName,
  })

  function useDate({ dateSelectionMode = 'full' }: UseDateParams = {}) {
    const store = scopedStore.useStoreApi()

    const rawDate = useStoreWithDateSelected(
      store,
      ({ endDate }) => endDate,
    )

    return useMemo(
      () => getEffectiveDateForMode(dateSelectionMode, { date: rawDate }),
      [dateSelectionMode, rawDate],
    )
  }

  function useDateActions() {
    const setDate = scopedStore.useSelector(
      ({ actions }) => actions.setDate,
    )

    return useMemo(
      () => ({ setDate }),
      [setDate],
    )
  }

  function useDateRange({ dateSelectionMode }: UseDateRangeParams) {
    const store = scopedStore.useStoreApi()

    const rawStartDate = useStoreWithDateSelected(
      store,
      ({ startDate }) => startDate,
    )

    const rawEndDate = useStoreWithDateSelected(
      store,
      ({ endDate }) => endDate,
    )

    return useMemo(
      () =>
        getEffectiveDateRangeForMode(dateSelectionMode, {
          startDate: rawStartDate,
          endDate: rawEndDate,
        }),
      [dateSelectionMode, rawStartDate, rawEndDate],
    )
  }

  function useDateRangeActions() {
    const setDateRange = scopedStore.useSelector(
      ({ actions }) => actions.setDateRange,
    )

    const setMonth = scopedStore.useSelector(
      ({ actions }) => actions.setMonth,
    )

    const setYear = scopedStore.useSelector(
      ({ actions }) => actions.setYear,
    )

    return useMemo(
      () => ({
        setDateRange,
        setMonth,
        setYear,
      }),
      [setDateRange, setMonth, setYear],
    )
  }

  function usePeriodAlignedActions() {
    const setMonthByPeriod = scopedStore.useSelector(
      ({ actions }) => actions.setMonthByPeriod,
    )

    return useMemo(
      () => ({ setMonthByPeriod }),
      [setMonthByPeriod],
    )
  }

  return {
    Provider: scopedStore.Provider,
    useDate,
    useDateActions,
    useDateRange,
    useDateRangeActions,
    usePeriodAlignedActions,
  }
}
