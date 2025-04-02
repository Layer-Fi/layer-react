import { ReactNode } from 'react'
import { BankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { useAugmentedBankTransactions } from '../../hooks/useBankTransactions/useAugmentedBankTransactions'

interface BankTransactionsProviderProps {
  children: ReactNode
}

export const BankTransactionsProvider = ({
  children,
}: BankTransactionsProviderProps) => {
  const bankTransactionsContextData = useAugmentedBankTransactions()
  return (
    <BankTransactionsContext.Provider value={bankTransactionsContextData}>
      {children}
    </BankTransactionsContext.Provider>
  )
}
