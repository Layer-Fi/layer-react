import { type ReactNode } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { ReceiptsContext } from '@providers/features/bankTransactions/Receipts/ReceiptsContext'
import { useReceipts } from '@hooks/legacy/useReceipts'

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
