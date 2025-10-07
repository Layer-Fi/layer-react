import { ReactNode, useMemo } from 'react'
import {
  TransactionsFiltersContext,
  TransactionsFiltersContextType,
} from './TransactionsFiltersContext'
import {
  useTransactionsFilters,
  UseTransactionsFiltersParams,
} from './useTransactionsFilters'
import { AccountItem } from '../../hooks/useBankTransactions/types'

type TransactionsFiltersProviderProps = {
  children: ReactNode
  accountsList: AccountItem[]
} & UseTransactionsFiltersParams

export const TransactionsFiltersProvider = ({
  children,
  accountsList,
  ...params
}: TransactionsFiltersProviderProps) => {
  const { filters, setFilters, dateFilterMode } = useTransactionsFilters(params)

  const value: TransactionsFiltersContextType = useMemo(
    () => ({
      filters,
      setFilters,
      dateFilterMode,
      accountsList,
    }),
    [filters, setFilters, dateFilterMode, accountsList],
  )

  return (
    <TransactionsFiltersContext.Provider value={value}>
      {children}
    </TransactionsFiltersContext.Provider>
  )
}
