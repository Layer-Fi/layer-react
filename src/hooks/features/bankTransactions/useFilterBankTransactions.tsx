import { useMemo } from 'react'

import { type BankTransaction, DisplayState } from '@internal-types/bankTransactions'
import { type BankTransactionFilters, filterVisibility, type NumericRangeFilter } from '@utils/bankTransactions/shared'

const applyAccountFilter = (data: BankTransaction[], filter: string[]) =>
  data.filter(x => !!x.sourceAccountId && filter.includes(x.sourceAccountId))

const applyCategorizationStatusFilter = (data: BankTransaction[], filter: DisplayState) =>
  data.filter(
    tx =>
      filterVisibility(filter, tx)
      || filter === DisplayState.all
      || (filter === DisplayState.review && tx.recentlyCategorized)
      || (filter === DisplayState.categorized && tx.recentlyCategorized),
  )

const applyAmountFilter = (data: BankTransaction[], filter: NumericRangeFilter) =>
  data.filter(x =>
    (filter.min === undefined || x.amount >= filter.min * 100)
    && (filter.max === undefined || x.amount <= filter.max * 100),
  )

export const useFilterBankTransactions = ({
  data,
  filters,
}: {
  data?: BankTransaction[]
  filters?: BankTransactionFilters
}) => {
  return useMemo(() => {
    if (!data) return

    let filtered = data

    if (filters?.categorizationStatus) {
      filtered = applyCategorizationStatusFilter(filtered, filters.categorizationStatus)
    }

    if (filters?.amount?.min !== undefined || filters?.amount?.max !== undefined) {
      filtered = applyAmountFilter(filtered, filters.amount)
    }

    if (filters?.account) {
      filtered = applyAccountFilter(filtered, filters.account)
    }

    return filtered
  }, [filters, data])
}
