import React, { ReactNode } from 'react'
import { BankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { useBankTransactions } from '../../hooks/useBankTransactions'

interface BankTransactionsProviderProps {
  children: ReactNode
}

export const BankTransactionsProvider = ({
  children,
}: BankTransactionsProviderProps) => {
  const bankTransactionsContextData = useBankTransactions()
  return (
    <BankTransactionsContext.Provider value={bankTransactionsContextData}>
      {children}
    </BankTransactionsContext.Provider>
  )
}
