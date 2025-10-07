import { ReactNode, useMemo } from 'react'
import { BankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { useAugmentedBankTransactions } from '../../hooks/useBankTransactions/useAugmentedBankTransactions'
import {
  TransactionsFiltersProvider,
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
  const { filters } = useTransactionsFilters({
    scope,
    monthlyView,
    applyGlobalDateRange,
  })

  const bankTransactionsContextData = useAugmentedBankTransactions({ filters })

  const accountsList = useMemo(
    () => (bankTransactionsContextData.data ? collectAccounts(bankTransactionsContextData.data) : []),
    [bankTransactionsContextData.data],
  )

  return (
    <TransactionsFiltersProvider
      accountsList={accountsList}
      scope={scope}
      monthlyView={monthlyView}
      applyGlobalDateRange={applyGlobalDateRange}
    >
      <BankTransactionsContext.Provider value={bankTransactionsContextData}>
        {children}
      </BankTransactionsContext.Provider>
    </TransactionsFiltersProvider>
  )
}
