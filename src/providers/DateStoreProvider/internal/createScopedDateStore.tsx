import { type PropsWithChildren, type ReactNode, useMemo } from 'react'

import type { DateSelectionMode } from '@utils/date/dateRange'
import { DatePreset } from '@utils/date/dateRangePresets'
import { createScopedStore } from '@utils/zustand/createScopedStore'
import { useStoreWithDateSelected } from '@utils/zustand/useStoreWithDateSelected'
import { buildDateStore, type MakeDateStoreOptions } from '@providers/DateStoreProvider/internal/buildDateStore'
import { getEffectiveDateForMode, getEffectiveDateRangeForMode } from '@providers/DateStoreProvider/internal/dateStoreUtils'
import { useResolvedInitialRange } from '@providers/DateStoreProvider/internal/useResolvedInitialRange'

type DateStoreApi = ReturnType<typeof buildDateStore>

export type CreateScopedDateStoreOptions = MakeDateStoreOptions & {
  storeName?: string
}

type ProviderProps = PropsWithChildren<{
  /**
   * Rendered while a context-dependent preset (e.g. `AllTime`) waits for the
   * business context to resolve. Keep this scoped to just the date pickers and
   * date-dependent tables so the rest of the page is not blocked. Relative
   * presets resolve synchronously and never show the fallback.
   */
  fallback?: ReactNode
}>

type UseDateParams = {
  dateSelectionMode?: DateSelectionMode
}

type UseDateRangeParams = {
  dateSelectionMode: DateSelectionMode
}

export function createScopedDateStore({
  storeName = 'DateStore',
  initialDatePreset = DatePreset.ThisMonth,
}: CreateScopedDateStoreOptions = {}) {
  const scopedStore = createScopedStore<DateStoreApi>({ storeName })

  /**
   * Deferred construction: the store is not created until its initial range can
   * be fully resolved. The store is therefore born-correct — consumers never
   * observe a wrong or absent date, and no `useEffect` hydration is needed.
   */
  function Provider({ children, fallback = null }: ProviderProps) {
    const resolved = useResolvedInitialRange(initialDatePreset)

    if (resolved.status === 'loading') {
      return <>{fallback}</>
    }

    const { range } = resolved

    return (
      <scopedStore.Provider
        createStore={() => buildDateStore({ initialRange: range, initialPreset: initialDatePreset })}
      >
        {children}
      </scopedStore.Provider>
    )
  }

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

  function usePreset() {
    return scopedStore.useSelector(({ preset }) => preset)
  }

  function useDateRangeActions() {
    const setDateRange = scopedStore.useSelector(
      ({ actions }) => actions.setDateRange,
    )

    const setPresetRange = scopedStore.useSelector(
      ({ actions }) => actions.setPresetRange,
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
        setPresetRange,
        setMonth,
        setYear,
      }),
      [setDateRange, setPresetRange, setMonth, setYear],
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
    Provider,
    useDate,
    useDateActions,
    useDateRange,
    useDateRangeActions,
    usePeriodAlignedActions,
    usePreset,
  }
}
