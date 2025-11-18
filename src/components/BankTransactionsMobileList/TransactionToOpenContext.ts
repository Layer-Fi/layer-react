import { createContext, useCallback, useState } from 'react'

type UseTransactionToOpen = () => {
  transactionIdToOpen?: string
  setTransactionIdToOpen: (id: string) => void
  clearTransactionIdToOpen: () => void
}

export const useTransactionToOpen: UseTransactionToOpen = () => {
  const [transactionIdToOpen, setTransactionIdToOpen] = useState<
    string | undefined
  >(undefined)

  const clearTransactionIdToOpen = useCallback(() => setTransactionIdToOpen(undefined), [])

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
