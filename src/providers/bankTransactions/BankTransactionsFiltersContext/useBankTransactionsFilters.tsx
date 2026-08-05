import { useCallback, useMemo, useState } from 'react'

import { DisplayState } from '@internal-types/features/bankTransactions/bankTransaction'
import { type BankTransactionFilters, BankTransactionsDateFilterMode } from '@utils/features/bankTransactions/shared'
import { BookkeepingStatus } from '@api/businesses/[business-id]/bookkeeping/status/get'
import { useEffectiveBookkeepingStatus } from '@hooks/features/bookkeeping/useEffectiveBookkeepingStatus'
import { useBankTransactionsIsCategorizationEnabledContext } from '@providers/categorization/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { useGlobalDateRange } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'

export type useBankTransactionsFiltersParams = {
  scope?: DisplayState
  monthlyView?: boolean
  applyGlobalDateRange?: boolean
  filters?: BankTransactionFilters
}

export const useBankTransactionsFilters = ({
  scope,
  monthlyView,
  applyGlobalDateRange,
  filters: paramsFilters,
}: useBankTransactionsFiltersParams,
) => {
  const effectiveBookkeepingStatus = useEffectiveBookkeepingStatus()
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  const defaultCategorizationStatus = isCategorizationEnabled ? DisplayState.review : DisplayState.all

  const dateFilterMode = applyGlobalDateRange
    ? BankTransactionsDateFilterMode.GlobalDateRange
    : monthlyView
      ? BankTransactionsDateFilterMode.MonthlyView
      : undefined

  const globalDateRange = useGlobalDateRange({ dateSelectionMode: 'full' })
  const globalMonthRange = useGlobalDateRange({ dateSelectionMode: 'month' })

  const initialFilters: BankTransactionFilters = {
    ...(scope && { categorizationStatus: scope }),
  }

  const [baseFilters, setBaseFilters] =
    useState<BankTransactionFilters>(initialFilters)

  const dateRange = dateFilterMode === BankTransactionsDateFilterMode.GlobalDateRange
    ? globalDateRange
    : dateFilterMode === BankTransactionsDateFilterMode.MonthlyView
      ? globalMonthRange
      : undefined

  // Defensively memoize passed filters to avoid re-renders when the object reference
  // changes but the content is the same.
  const stableParamsFilters = useMemo(
    () => paramsFilters,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(paramsFilters)],
  )

  const isActiveBookkeeping = effectiveBookkeepingStatus === BookkeepingStatus.ACTIVE

  const filters = useMemo(
    () => ({
      categorizationStatus: defaultCategorizationStatus,
      ...baseFilters,
      dateRange,
      ...stableParamsFilters,
      // If bookkeeping is active, we want to show all transactions, so we override any other
      // passed categorization status filter to DisplayState.all.
      ...(isActiveBookkeeping && { categorizationStatus: DisplayState.all }),
    }),
    [
      defaultCategorizationStatus,
      baseFilters,
      stableParamsFilters,
      dateRange,
      isActiveBookkeeping,
    ],
  )

  const setFilters = useCallback((newFilters: BankTransactionFilters) => {
    setBaseFilters((prevFilters: BankTransactionFilters) => ({
      ...prevFilters,
      ...newFilters,
    }))
  }, [])

  const isMonthlyViewMode = dateFilterMode === BankTransactionsDateFilterMode.MonthlyView

  return useMemo(
    () => ({ filters, setFilters, dateFilterMode, isMonthlyViewMode }),
    [filters, setFilters, dateFilterMode, isMonthlyViewMode],
  )
}
