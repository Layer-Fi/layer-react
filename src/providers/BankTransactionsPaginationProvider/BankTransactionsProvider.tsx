import { type PropsWithChildren } from 'react'

import { useAugmentedBankTransactions } from '@hooks/features/bankTransactions/useAugmentedBankTransactions'
import { BankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'

export const BankTransactionsProvider = ({ children }: PropsWithChildren) => {
  const bankTransactionsData = useAugmentedBankTransactions()
  return (
    <BankTransactionsContext.Provider value={bankTransactionsData}>
      {children}
    </BankTransactionsContext.Provider>
  )
}
