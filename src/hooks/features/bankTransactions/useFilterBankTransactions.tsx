import { useMemo } from 'react'

import { type BankTransaction, DisplayState } from '@internal-types/bankTransactions'
import { type BankTransactionFilters, filterVisibility } from '@utils/bankTransactions/shared'

const applyCategorizationStatusFilter = (data: BankTransaction[], filter: DisplayState) =>
  data.filter(
    tx =>
      filterVisibility(filter, tx)
      || filter === DisplayState.all
      || (filter === DisplayState.review && tx.recentlyCategorized)
      || (filter === DisplayState.categorized && tx.recentlyCategorized),
  )

type UseFilterBankTransactionsOptions = {
  data?: BankTransaction[]
  filters?: BankTransactionFilters
}

export const useFilterBankTransactions = ({ data, filters }: UseFilterBankTransactionsOptions) => {
  return useMemo(() => {
    if (!data) return

    let filtered = data

    if (filters?.categorizationStatus) {
      filtered = applyCategorizationStatusFilter(filtered, filters.categorizationStatus)
    }

    return filtered
  }, [filters, data])
}
