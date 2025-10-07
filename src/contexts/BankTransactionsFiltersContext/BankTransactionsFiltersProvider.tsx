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
  const { filters, setFilters, dateFilterMode } = useBankTransactionsFilters(params)

  const value: BankTransactionsFiltersContextType = useMemo(
    () => ({
      filters,
      setFilters,
      dateFilterMode,
    }),
    [filters, setFilters, dateFilterMode],
  )

  return (
    <BankTransactionsFiltersContext.Provider value={value}>
      {children}
    </BankTransactionsFiltersContext.Provider>
  )
}
