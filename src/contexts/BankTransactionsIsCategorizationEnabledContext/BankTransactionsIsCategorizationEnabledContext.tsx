import { createContext, type PropsWithChildren, useContext } from 'react'

import { useLegacyMode } from '@providers/LegacyModeProvider/LegacyModeProvider'
import { useBookkeepingStatusContext } from '@contexts/BookkeepingStatusContext/BookkeepingStatusContext'

type BankTransactionsIsCategorizationEnabledContextType = boolean

const BankTransactionsIsCategorizationEnabledContext =
  createContext<BankTransactionsIsCategorizationEnabledContextType>(false)

export const BankTransactionsIsCategorizationEnabledProvider = ({ children }: PropsWithChildren) => {
  const { isActiveBookkeepingStatus } = useBookkeepingStatusContext()
  const { overrideMode } = useLegacyMode()

  const isCategorizationEnabled = overrideMode === 'bookkeeping-client'
    ? false
    : !isActiveBookkeepingStatus

  return (
    <BankTransactionsIsCategorizationEnabledContext.Provider value={isCategorizationEnabled}>
      {children}
    </BankTransactionsIsCategorizationEnabledContext.Provider>
  )
}

export const useBankTransactionsIsCategorizationEnabledContext = () =>
  useContext(BankTransactionsIsCategorizationEnabledContext)
