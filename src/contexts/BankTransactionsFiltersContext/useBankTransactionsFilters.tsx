import { useCallback, useMemo, useState } from 'react'
import { endOfMonth, startOfMonth } from 'date-fns'
import {
  BankTransactionFilters,
  BankTransactionsDateFilterMode,
} from '../../hooks/useBankTransactions/types'
import { DisplayState } from '../../types'
import { useGlobalDateRange } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

export type useBankTransactionsFiltersParams = {
  scope?: DisplayState
  monthlyView?: boolean
  applyGlobalDateRange?: boolean
}

export const useBankTransactionsFilters = (
  params?: useBankTransactionsFiltersParams,
) => {
  const dateFilterMode = params?.applyGlobalDateRange
    ? BankTransactionsDateFilterMode.GlobalDateRange
    : params?.monthlyView
      ? BankTransactionsDateFilterMode.MonthlyView
      : undefined

  const globalDateRange = useGlobalDateRange({ displayMode: 'monthPicker' })

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

  const filters = useMemo(
    () => ({
      ...baseFilters,
      ...(dateFilterMode === BankTransactionsDateFilterMode.GlobalDateRange && {
        dateRange: globalDateRange,
      }),
    }),
    [dateFilterMode, baseFilters, globalDateRange],
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
