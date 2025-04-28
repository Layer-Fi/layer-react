import { ReactNode } from 'react'
import { ReceiptsContext } from '../../contexts/ReceiptsContext'
import { useReceipts } from '../../hooks/useReceipts/useReceipts'
import { BankTransaction } from '../../types'

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
