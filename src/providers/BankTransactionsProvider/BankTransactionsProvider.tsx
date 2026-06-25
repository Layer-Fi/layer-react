import { type ReactNode, useMemo } from 'react'

import { BankTransactionsDateFilterMode } from '@utils/bankTransactions/shared'
import { useAugmentedBankTransactions } from '@hooks/features/bankTransactions/useAugmentedBankTransactions'
import { useBankTransactionsPagination } from '@hooks/features/bankTransactions/useBankTransactionsPagination'
import { BankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'

interface BankTransactionsProviderProps {
  children: ReactNode
  pageSize?: number
}

export const BankTransactionsProvider = ({
  children,
  pageSize = 20,
}: BankTransactionsProviderProps) => {
  const { filters, dateFilterMode } = useBankTransactionsFiltersContext()

  const bankTransactionsData = useAugmentedBankTransactions({ filters })
  const { data, hasMore, fetchMore } = bankTransactionsData

  const isMonthlyViewMode = dateFilterMode === BankTransactionsDateFilterMode.MonthlyView

  const paginationProps = useBankTransactionsPagination({
    data,
    hasMore,
    fetchMore,
    filters,
    pageSize,
  })

  const bankTransactionsContextData = useMemo(() => ({
    ...bankTransactionsData,
    isMonthlyViewMode,
    paginationProps,
  }), [bankTransactionsData, isMonthlyViewMode, paginationProps])

  return (
    <BankTransactionsContext.Provider value={bankTransactionsContextData}>
      {children}
    </BankTransactionsContext.Provider>
  )
}
