import { type ReactNode } from 'react'

import { useAugmentedBankTransactions } from '@hooks/useBankTransactions/useAugmentedBankTransactions'
import { BankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import {
  BankTransactionsFiltersContext,
} from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useBankTransactionsFilters, type useBankTransactionsFiltersParams } from '@contexts/BankTransactionsFiltersContext/useBankTransactionsFilters'

interface BankTransactionsProviderProps extends useBankTransactionsFiltersParams {
  children: ReactNode
}

export const BankTransactionsProvider = ({
  children,
  scope,
  monthlyView,
  applyGlobalDateRange,
  categorizeView,
  filters,
}: BankTransactionsProviderProps) => {
  const filtersContextValue = useBankTransactionsFilters({
    scope,
    monthlyView,
    applyGlobalDateRange,
    categorizeView,
    filters,
  })

  const bankTransactionsContextData = useAugmentedBankTransactions({ filters: filtersContextValue.filters })

  return (
    <BankTransactionsFiltersContext.Provider value={filtersContextValue}>
      <BankTransactionsContext.Provider value={bankTransactionsContextData}>
        {children}
      </BankTransactionsContext.Provider>
    </BankTransactionsFiltersContext.Provider>
  )
}
