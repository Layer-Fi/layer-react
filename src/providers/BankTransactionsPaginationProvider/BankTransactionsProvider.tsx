import { type ReactNode } from 'react'

import { useAugmentedBankTransactions } from '@hooks/features/bankTransactions/useAugmentedBankTransactions'
import { BankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'

interface BankTransactionsProviderProps {
  children: ReactNode
}

export const BankTransactionsProvider = ({
  children,
}: BankTransactionsProviderProps) => {
  const { filters } = useBankTransactionsFiltersContext()

  const bankTransactionsData = useAugmentedBankTransactions({ filters })

  return (
    <BankTransactionsContext.Provider value={bankTransactionsData}>
      {children}
    </BankTransactionsContext.Provider>
  )
}
