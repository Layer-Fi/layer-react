import { ReactNode } from 'react'
import {
  BankTransactionsFiltersContext,
} from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useBankTransactionsFilters, useBankTransactionsFiltersParams } from '@contexts/BankTransactionsFiltersContext/useBankTransactionsFilters'

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
