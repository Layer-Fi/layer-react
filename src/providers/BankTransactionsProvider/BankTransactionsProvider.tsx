import { ReactNode } from 'react'
import { BankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { useAugmentedBankTransactions } from '../../hooks/useBankTransactions/useAugmentedBankTransactions'
import {
  BankTransactionsFiltersContext,
} from '../../contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useBankTransactionsFilters, useBankTransactionsFiltersParams } from '../../contexts/BankTransactionsFiltersContext/useBankTransactionsFilters'
import { CategorizationRulesProvider } from '../../contexts/CategorizationRulesContext/CategorizationRulesContext'
import { BankTransactionsRouteStoreProvider } from '../BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'

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
    <CategorizationRulesProvider>
      <BankTransactionsRouteStoreProvider>
        <BankTransactionsFiltersContext.Provider value={filtersContextValue}>
          <BankTransactionsContext.Provider value={bankTransactionsContextData}>
            {children}
          </BankTransactionsContext.Provider>
        </BankTransactionsFiltersContext.Provider>
      </BankTransactionsRouteStoreProvider>
    </CategorizationRulesProvider>
  )
}
