import { type PropsWithChildren } from 'react'

import { BankTransactionsContext } from '@providers/features/bankTransactions/BankTransactions/BankTransactionsContext'
import { useAugmentedBankTransactions } from '@providers/features/bankTransactions/BankTransactions/useAugmentedBankTransactions'

export const BankTransactionsProvider = ({ children }: PropsWithChildren) => {
  const bankTransactionsData = useAugmentedBankTransactions()
  return (
    <BankTransactionsContext.Provider value={bankTransactionsData}>
      {children}
    </BankTransactionsContext.Provider>
  )
}
