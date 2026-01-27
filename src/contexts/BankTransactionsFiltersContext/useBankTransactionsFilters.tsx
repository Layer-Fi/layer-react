import { useCallback, useEffect, useMemo, useState } from 'react'
import { endOfMonth, startOfMonth } from 'date-fns'

import { DisplayState } from '@internal-types/bank_transactions'
import { BookkeepingStatus, useEffectiveBookkeepingStatus } from '@hooks/bookkeeping/useBookkeepingStatus'
import {
  type BankTransactionFilters,
  BankTransactionsDateFilterMode,
} from '@hooks/useBankTransactions/types'
import { useCurrentBankTransactionsPage } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'

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

  const defaultDateRange = {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  }

  const initialFilters: BankTransactionFilters = {
    ...(scope && { categorizationStatus: scope }),
    ...(dateFilterMode === BankTransactionsDateFilterMode.MonthlyView && {
      dateRange: defaultDateRange,
    }),
  }

  const [baseFilters, setBaseFilters] =
    useState<BankTransactionFilters>(initialFilters)

  const dateRange = dateFilterMode === BankTransactionsDateFilterMode.GlobalDateRange
    ? globalDateRange
    : dateFilterMode === BankTransactionsDateFilterMode.MonthlyView
      ? baseFilters.dateRange
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

  const { setCurrentBankTransactionsPage: setCurrentPage } = useCurrentBankTransactionsPage()

  // Reset page to 1 when any of the filters changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, setCurrentPage])

  return useMemo(
    () => ({
      filters,
      setFilters,
      dateFilterMode,
    }),
    [filters, setFilters, dateFilterMode],
  )
}
