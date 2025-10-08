import { ReactNode, useMemo } from 'react'
import {
  BankTransactionsFiltersContext,
  BankTransactionsFiltersContextType,
} from './BankTransactionsFiltersContext'
import { useBankTransactionsFilters, useBankTransactionsFiltersParams } from './useBankTransactionsFilters'

type TransactionsFiltersProviderProps = {
  children: ReactNode
} & useBankTransactionsFiltersParams

export const TransactionsFiltersProvider = ({
  children,
  ...params
}: TransactionsFiltersProviderProps) => {
  const contextValue = useBankTransactionsFilters(params)

  return (
    <BankTransactionsFiltersContext.Provider value={contextValue}>
      {children}
    </BankTransactionsFiltersContext.Provider>
  )
}
