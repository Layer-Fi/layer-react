import { createContext, useState } from 'react'

type UseTransactionToOpen = () => {
  transactionIdToOpen?: string
  setTransactionIdToOpen: (id: string) => void
  clearTransactionIdToOpen: () => void
}

export const useTransactionToOpen: UseTransactionToOpen = () => {
  const [transactionIdToOpen, setTransactionIdToOpen] = useState<
    string | undefined
  >(undefined)

  const clearTransactionIdToOpen = () => setTransactionIdToOpen(undefined)

  return {
    transactionIdToOpen,
    setTransactionIdToOpen,
    clearTransactionIdToOpen,
  }
}

export type TransactionToOpenContextType = ReturnType<
  typeof useTransactionToOpen
>
export const TransactionToOpenContext =
  createContext<TransactionToOpenContextType>({
    transactionIdToOpen: undefined,
    setTransactionIdToOpen: () => undefined,
    clearTransactionIdToOpen: () => undefined,
  })
