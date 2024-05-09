import React, { ReactNode } from 'react'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'

interface LinkedAccountsProviderProps {
  children: ReactNode
}

export const LinkedAccountsProvider = ({
  children,
}: LinkedAccountsProviderProps) => {
  const linkedAccountsContextData = useLinkedAccounts()
  return (
    <LinkedAccountsContext.Provider value={linkedAccountsContextData}>
      {children}
    </LinkedAccountsContext.Provider>
  )
}
