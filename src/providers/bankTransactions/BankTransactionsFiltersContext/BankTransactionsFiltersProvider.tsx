import { type ReactNode } from 'react'

import {
  BankTransactionsFiltersContext,
} from '@providers/bankTransactions/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useBankTransactionsFilters, type useBankTransactionsFiltersParams } from '@providers/bankTransactions/BankTransactionsFiltersContext/useBankTransactionsFilters'

type BankTransactionsFiltersProviderProps = {
  children: ReactNode
} & useBankTransactionsFiltersParams

export const BankTransactionsFiltersProvider = ({
  children,
  ...params
}: BankTransactionsFiltersProviderProps) => {
  const contextValue = useBankTransactionsFilters(params)

  return (
    <BankTransactionsFiltersContext.Provider value={contextValue}>
      {children}
    </BankTransactionsFiltersContext.Provider>
  )
}
