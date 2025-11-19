import { type ReactNode } from 'react'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { useReceipts } from '@hooks/useReceipts/useReceipts'
import { ReceiptsContext } from '@contexts/ReceiptsContext/ReceiptsContext'

interface ReceiptsProviderProps {
  children: ReactNode
  bankTransaction: BankTransaction
  isActive?: boolean
}

export const ReceiptsProvider = ({
  children,
  bankTransaction,
  isActive,
}: ReceiptsProviderProps) => {
  const contextData = useReceipts({ bankTransaction, isActive })

  return (
    <ReceiptsContext.Provider value={contextData}>
      {children}
    </ReceiptsContext.Provider>
  )
}
