import { useMemo } from 'react'

import { createScopedStore } from '@utils/zustand/createScopedStore'
import { useStoreWithDateSelected } from '@utils/zustand/useStoreWithDateSelected'
import { buildDateStore, type MakeDateStoreOptions } from '@providers/DateStore/internal/buildDateStore'
import { getEffectiveDateForMode, getEffectiveDateRangeForMode } from '@providers/DateStore/internal/dateStoreUtils'
import type { DateSelectionMode } from '@providers/DateStore/internal/types'

type DateStoreApi = ReturnType<typeof buildDateStore>
type DateStoreState = ReturnType<DateStoreApi['getState']>

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
  const scopedStore = createScopedStore<DateStoreState>({
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
