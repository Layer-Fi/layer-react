import { ReactNode } from 'react'
import { BankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useAugmentedBankTransactions } from '@hooks/useBankTransactions/useAugmentedBankTransactions'
import {
  BankTransactionsFiltersContext,
} from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useBankTransactionsFilters, useBankTransactionsFiltersParams } from '@contexts/BankTransactionsFiltersContext/useBankTransactionsFilters'

interface BankTransactionsProviderProps extends useBankTransactionsFiltersParams {
  children: ReactNode
}

export const BankTransactionsProvider = ({
  children,
  scope,
  monthlyView,
  applyGlobalDateRange,
}: BankTransactionsProviderProps) => {
  const filtersContextValue = useBankTransactionsFilters({
    scope,
    monthlyView,
    applyGlobalDateRange,
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
