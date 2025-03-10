import { type PropsWithChildren } from 'react'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'

export function LinkedAccountsProvider({ children }: PropsWithChildren) {
  const linkedAccountsContextData = useLinkedAccounts()

  return (
    <LinkedAccountsContext.Provider value={linkedAccountsContextData}>
      {children}
    </LinkedAccountsContext.Provider>
  )
}
