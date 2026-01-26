import { createContext, type ReactNode, useContext } from 'react'

import { useBankTransactionsIsCategorizationEnabled } from '@hooks/useBankTransactions/useBankTransactionsIsCategorizationEnabled'

type BankTransactionsIsCategorizationEnabledContextType = boolean

const BankTransactionsIsCategorizationEnabledContext =
  createContext<BankTransactionsIsCategorizationEnabledContextType>(false)

interface BankTransactionsIsCategorizationEnabledProviderProps {
  children: ReactNode
  categorizeView?: boolean
}

export const BankTransactionsIsCategorizationEnabledProvider = ({
  children,
  categorizeView,
}: BankTransactionsIsCategorizationEnabledProviderProps) => {
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabled({ categorizeView })

  return (
    <BankTransactionsIsCategorizationEnabledContext.Provider value={isCategorizationEnabled}>
      {children}
    </BankTransactionsIsCategorizationEnabledContext.Provider>
  )
}

export const useBankTransactionsIsCategorizationEnabledContext = () =>
  useContext(BankTransactionsIsCategorizationEnabledContext)
