import { useCallback, useMemo, useState } from 'react'
import { endOfMonth, startOfMonth } from 'date-fns'

import { DisplayState } from '@internal-types/bank_transactions'
import { isCategorizationEnabledForStatus } from '@utils/bookkeeping/isCategorizationEnabled'
import { BookkeepingStatus, useEffectiveBookkeepingStatus } from '@hooks/bookkeeping/useBookkeepingStatus'
import {
  type BankTransactionFilters,
  BankTransactionsDateFilterMode,
} from '@hooks/useBankTransactions/types'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'

export type useBankTransactionsFiltersParams = {
  scope?: DisplayState
  monthlyView?: boolean
  applyGlobalDateRange?: boolean
  categorizeView?: boolean
  filters?: BankTransactionFilters
}

export const useBankTransactionsFilters = (
  params?: useBankTransactionsFiltersParams,
) => {
  const effectiveBookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(effectiveBookkeepingStatus)
  const effectiveCategorizeView = params?.categorizeView ?? categorizationEnabled

  const defaultCategorizationStatus = useMemo(() => {
    if (effectiveBookkeepingStatus === BookkeepingStatus.ACTIVE) {
      return DisplayState.all
    }
    if (!categorizationEnabled && !effectiveCategorizeView) {
      return DisplayState.categorized
    }
    return DisplayState.review
  }, [effectiveBookkeepingStatus, effectiveCategorizeView, categorizationEnabled])

  const dateFilterMode = params?.applyGlobalDateRange
    ? BankTransactionsDateFilterMode.GlobalDateRange
    : params?.monthlyView
      ? BankTransactionsDateFilterMode.MonthlyView
      : undefined

  const globalDateRange = useGlobalDateRange({ dateSelectionMode: 'full' })

  const defaultDateRange = {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  }

  const initialFilters: BankTransactionFilters = {
    ...(params?.scope && { categorizationStatus: params?.scope }),
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

  const filters = useMemo(
    () => ({
      categorizationStatus: defaultCategorizationStatus,
      ...baseFilters,
      dateRange,
      ...params?.filters,
    }),
    [defaultCategorizationStatus, baseFilters, params?.filters, dateRange],
  )

  const setFilters = useCallback((newFilters: BankTransactionFilters) => {
    setBaseFilters((prevFilters: BankTransactionFilters) => ({
      ...prevFilters,
      ...newFilters,
    }))
  }, [])

  return useMemo(
    () => ({
      filters,
      setFilters,
      dateFilterMode,
    }),
    [filters, setFilters, dateFilterMode],
  )
}
