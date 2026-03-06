import { createContext, type PropsWithChildren, useContext } from 'react'

import { isCategorizationEnabledForStatus } from '@utils/bookkeeping/isCategorizationEnabled'
import { useEffectiveBookkeepingStatus } from '@hooks/api/businesses/business-id/bookkeeping/status/useBookkeepingStatus'

const useBankTransactionsIsCategorizationEnabled = () => {
  const effectiveBookkeepingStatus = useEffectiveBookkeepingStatus()
  const isCategorizationEnabled = isCategorizationEnabledForStatus(effectiveBookkeepingStatus)

  return isCategorizationEnabled
}

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
