import { type PropsWithChildren, type ReactNode, useCallback, useMemo } from 'react'

import type { DateSelectionMode } from '@utils/date/dateRange'
import { DatePreset, type SelectableDatePreset } from '@utils/date/dateRangePresets'
import { createScopedStore } from '@utils/zustand/createScopedStore'
import { useStoreWithDateSelected } from '@utils/zustand/useStoreWithDateSelected'
import { buildDateStore, type MakeDateStoreOptions } from '@providers/DateStoreProvider/internal/buildDateStore'
import { getEffectiveDateForMode, getEffectiveDateRangeForMode } from '@providers/DateStoreProvider/internal/dateStoreUtils'
import { useBusinessActivationDateSafe, useDerivedInitialDateRange } from '@providers/DateStoreProvider/internal/useResolvedInitialRange'

type DateStoreApi = ReturnType<typeof buildDateStore>

export type CreateScopedDateStoreOptions = MakeDateStoreOptions & {
  storeName?: string
}

type ProviderProps = PropsWithChildren<{
  /**
   * Rendered while a business context-dependent preset (e.g. `AllTime`) waits for the
   * business context to resolve.
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
   * be fully resolved.
   */
  function Provider({ children, fallback = null }: ProviderProps) {
    const initialRange = useDerivedInitialDateRange(initialDatePreset)

    if (initialRange.status === 'loading') {
      return <>{fallback}</>
    }

    return (
      <scopedStore.Provider
        createStore={() => buildDateStore({ initialRange: initialRange.range, initialPreset: initialDatePreset })}
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
    const activationDate = useBusinessActivationDateSafe()
    const setDate = scopedStore.useSelector(
      ({ actions }) => actions.setDate,
    )

    return useMemo(
      () => ({
        setDate: (options: { date: Date }) => setDate(options, activationDate),
      }),
      [setDate, activationDate],
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

  function useDatePreset() {
    return scopedStore.useSelector(({ preset }) => preset)
  }

  function useDateRangeActions() {
    const activationDate = useBusinessActivationDateSafe()

    const setDateRangeAction = scopedStore.useSelector(
      ({ actions }) => actions.setDateRange,
    )

    const setMonthAction = scopedStore.useSelector(
      ({ actions }) => actions.setMonth,
    )

    const setYearAction = scopedStore.useSelector(
      ({ actions }) => actions.setYear,
    )

    const setDateRange = useCallback(
      (options: { startDate: Date, endDate: Date }) => setDateRangeAction(options, activationDate),
      [setDateRangeAction, activationDate],
    )

    const setMonth = useCallback(
      (options: { startDate: Date }) => setMonthAction(options, activationDate),
      [setMonthAction, activationDate],
    )

    const setYear = useCallback(
      (options: { startDate: Date }) => setYearAction(options, activationDate),
      [setYearAction, activationDate],
    )

    return useMemo(
      () => ({ setDateRange, setMonth, setYear }),
      [setDateRange, setMonth, setYear],
    )
  }

  function useDatePresetActions() {
    const activationDate = useBusinessActivationDateSafe()

    const setDatePresetAction = scopedStore.useSelector(
      ({ actions }) => actions.setDatePreset,
    )

    const setDatePreset = useCallback(
      (options: { datePreset: SelectableDatePreset }) => setDatePresetAction(options, activationDate),
      [setDatePresetAction, activationDate],
    )

    return useMemo(
      () => ({ setDatePreset }),
      [setDatePreset],
    )
  }

  function usePeriodAlignedActions() {
    const activationDate = useBusinessActivationDateSafe()
    const setMonthByPeriod = scopedStore.useSelector(
      ({ actions }) => actions.setMonthByPeriod,
    )

    return useMemo(
      () => ({
        setMonthByPeriod: (options: { monthNumber: number, yearNumber: number }) =>
          setMonthByPeriod(options, activationDate),
      }),
      [setMonthByPeriod, activationDate],
    )
  }

  return {
    Provider,
    useDate,
    useDateActions,
    useDateRange,
    useDateRangeActions,
    useDatePreset,
    useDatePresetActions,
    usePeriodAlignedActions,
  }
}
