import { type ReactNode } from 'react'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { useReceipts } from '@hooks/legacy/useReceipts'
import { ReceiptsContext } from '@providers/bankTransactions/Receipts/ReceiptsContext'

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
