import { type ReactNode } from 'react'

import { useBankTransactionsPagination } from '@hooks/features/bankTransactions/useBankTransactionsPagination'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { BankTransactionsPaginationContext } from '@contexts/BankTransactionsPaginationContext/BankTransactionsPaginationContext'

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
