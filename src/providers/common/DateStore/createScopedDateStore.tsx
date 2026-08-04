import { type PropsWithChildren, type ReactNode, useCallback, useMemo } from 'react'

import { type DateSelectionMode, getEffectiveDateForMode, getEffectiveDateRangeForMode } from '@utils/date/dateRange'
import { DatePreset, deriveDateRangeFromPreset, type SelectableDatePreset } from '@utils/date/dateRangePresets'
import { createScopedStore } from '@utils/zustand/createScopedStore'
import { useStoreWithDateSelected } from '@utils/zustand/useStoreWithDateSelected'
import { buildDateStore, type MakeDateStoreOptions } from '@providers/common/DateStore/buildDateStore'

type DateStoreApi = ReturnType<typeof buildDateStore>

/**
 * Supplied by the caller so this factory stays free of business/LayerContext knowledge.
 * `hasBusinessContext` distinguishes "the activation date is still loading" from "it can
 * never arrive here", which is the difference between the fallback and a thrown error.
 */
export type UseActivationDate = () => {
  activationDate: Date | undefined
  hasBusinessContext: boolean
}

export type CreateScopedDateStoreOptions = MakeDateStoreOptions & {
  storeName?: string
  useActivationDate: UseActivationDate
}

type ProviderProps = PropsWithChildren<{
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
  useActivationDate,
}: CreateScopedDateStoreOptions) {
  const scopedStore = createScopedStore<DateStoreApi>({ storeName })

  function Provider({ children, fallback = null }: ProviderProps) {
    const { activationDate, hasBusinessContext } = useActivationDate()
    const initialRange = deriveDateRangeFromPreset(initialDatePreset, activationDate)

    if (!initialRange && !hasBusinessContext) {
      throw new Error(
        'An AllTime date store must be mounted within a business context (below BusinessProvider).',
      )
    }

    if (!initialRange) {
      return <>{fallback}</>
    }

    return (
      <scopedStore.Provider
        createStore={() => buildDateStore({ initialRange, initialPreset: initialDatePreset })}
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
    const { activationDate } = useActivationDate()
    const setDate = scopedStore.useSelector(
      ({ actions }) => actions.setDate,
    )

    return useMemo(
      () => ({
        setDate: (options: { date: Date }) => setDate({ ...options, activationDate }),
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
    const { activationDate } = useActivationDate()

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
      (options: { startDate: Date, endDate: Date }) => setDateRangeAction({ ...options, activationDate }),
      [setDateRangeAction, activationDate],
    )

    const setMonth = useCallback(
      (options: { startDate: Date }) => setMonthAction({ ...options, activationDate }),
      [setMonthAction, activationDate],
    )

    const setYear = useCallback(
      (options: { startDate: Date }) => setYearAction({ ...options, activationDate }),
      [setYearAction, activationDate],
    )

    return useMemo(
      () => ({ setDateRange, setMonth, setYear }),
      [setDateRange, setMonth, setYear],
    )
  }

  function useDatePresetActions() {
    const { activationDate } = useActivationDate()

    const setDatePresetAction = scopedStore.useSelector(
      ({ actions }) => actions.setDatePreset,
    )

    const setDatePreset = useCallback(
      (options: { datePreset: SelectableDatePreset }) => setDatePresetAction({ ...options, activationDate }),
      [setDatePresetAction, activationDate],
    )

    return useMemo(
      () => ({ setDatePreset }),
      [setDatePreset],
    )
  }

  function usePeriodAlignedActions() {
    const { activationDate } = useActivationDate()
    const setMonthByPeriod = scopedStore.useSelector(
      ({ actions }) => actions.setMonthByPeriod,
    )

    return useMemo(
      () => ({
        setMonthByPeriod: (options: { monthNumber: number, yearNumber: number }) =>
          setMonthByPeriod({ ...options, activationDate }),
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
