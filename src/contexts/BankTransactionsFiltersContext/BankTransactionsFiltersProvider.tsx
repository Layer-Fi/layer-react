import { ReactNode, useMemo } from 'react'
import {
  BankTransactionsFiltersContext,
  BankTransactionsFiltersContextType,
} from './BankTransactionsFiltersContext'
import { useBankTransactionsFilters, useBankTransactionsFiltersParams } from './useBankTransactionsFilters'

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
