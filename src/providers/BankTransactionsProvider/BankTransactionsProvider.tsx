import { ReactNode, useMemo } from 'react'
import { BankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { useAugmentedBankTransactions } from '../../hooks/useBankTransactions/useAugmentedBankTransactions'
import {
  TransactionsFiltersContext,
  useTransactionsFilters,
  UseTransactionsFiltersParams,
} from '../../contexts/TransactionsFiltersContext'
import { collectAccounts } from '../../hooks/useBankTransactions/utils'

interface BankTransactionsProviderProps extends UseTransactionsFiltersParams {
  children: ReactNode
}

export const BankTransactionsProvider = ({
  children,
  scope,
  monthlyView,
  applyGlobalDateRange,
}: BankTransactionsProviderProps) => {
  const { filters, setFilters, dateFilterMode } = useTransactionsFilters({
    scope,
    monthlyView,
    applyGlobalDateRange,
  })

  const bankTransactionsContextData = useAugmentedBankTransactions({ filters })

  const accountsList = useMemo(
    () => (bankTransactionsContextData.data ? collectAccounts(bankTransactionsContextData.data) : []),
    [bankTransactionsContextData.data],
  )

  const filtersContextValue = useMemo(
    () => ({
      filters,
      setFilters,
      dateFilterMode,
      accountsList,
    }),
    [filters, setFilters, dateFilterMode, accountsList],
  )

  return (
    <TransactionsFiltersContext.Provider value={filtersContextValue}>
      <BankTransactionsContext.Provider value={bankTransactionsContextData}>
        {children}
      </BankTransactionsContext.Provider>
    </TransactionsFiltersContext.Provider>
  )
}
