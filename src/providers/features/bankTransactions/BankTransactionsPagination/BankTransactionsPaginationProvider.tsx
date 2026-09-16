import { type ReactNode } from 'react'

import { useBankTransactionsContext } from '@providers/features/bankTransactions/BankTransactions/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@providers/features/bankTransactions/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { BankTransactionsPaginationContext } from '@providers/features/bankTransactions/BankTransactionsPagination/BankTransactionsPaginationContext'
import { useBankTransactionsPagination } from '@providers/features/bankTransactions/BankTransactionsPagination/useBankTransactionsPagination'

interface BankTransactionsPaginationProviderProps {
  children: ReactNode
  pageSize?: number
}

export const BankTransactionsPaginationProvider = ({
  children,
  pageSize = 20,
}: BankTransactionsPaginationProviderProps) => {
  const { filters } = useBankTransactionsFiltersContext()
  const { data, hasMore, fetchMore } = useBankTransactionsContext()

  const paginationProps = useBankTransactionsPagination({
    data,
    hasMore,
    fetchMore,
    filters,
    pageSize,
  })

  return (
    <BankTransactionsPaginationContext.Provider value={paginationProps}>
      {children}
    </BankTransactionsPaginationContext.Provider>
  )
}
