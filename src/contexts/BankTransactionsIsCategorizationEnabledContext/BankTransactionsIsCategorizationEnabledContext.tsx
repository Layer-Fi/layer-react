import { createContext, type PropsWithChildren, useContext } from 'react'

import { useBankTransactionsIsCategorizationEnabled } from '@hooks/useBankTransactions/useBankTransactionsIsCategorizationEnabled'

type BankTransactionsIsCategorizationEnabledContextType = boolean

const BankTransactionsIsCategorizationEnabledContext =
  createContext<BankTransactionsIsCategorizationEnabledContextType>(false)

export const BankTransactionsIsCategorizationEnabledProvider = ({ children }: PropsWithChildren) => {
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabled()

  return (
    <BankTransactionsIsCategorizationEnabledContext.Provider value={isCategorizationEnabled}>
      {children}
    </BankTransactionsIsCategorizationEnabledContext.Provider>
  )
}

export const useBankTransactionsIsCategorizationEnabledContext = () =>
  useContext(BankTransactionsIsCategorizationEnabledContext)
