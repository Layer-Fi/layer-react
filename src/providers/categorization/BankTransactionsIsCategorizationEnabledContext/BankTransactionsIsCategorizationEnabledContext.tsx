import { createContext, type PropsWithChildren, useContext } from 'react'

import { useBookkeepingStatusContext } from '@contexts/BookkeepingStatusContext/BookkeepingStatusContext'

type BankTransactionsIsCategorizationEnabledContextType = boolean

const BankTransactionsIsCategorizationEnabledContext =
  createContext<BankTransactionsIsCategorizationEnabledContextType>(false)

export const BankTransactionsIsCategorizationEnabledProvider = ({ children }: PropsWithChildren) => {
  const { isActiveBookkeepingStatus } = useBookkeepingStatusContext()

  return (
    <BankTransactionsIsCategorizationEnabledContext.Provider value={!isActiveBookkeepingStatus}>
      {children}
    </BankTransactionsIsCategorizationEnabledContext.Provider>
  )
}

export const useBankTransactionsIsCategorizationEnabledContext = () =>
  useContext(BankTransactionsIsCategorizationEnabledContext)
