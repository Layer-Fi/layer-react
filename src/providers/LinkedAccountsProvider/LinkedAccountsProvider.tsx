import { type PropsWithChildren } from 'react'

import { useLinkedAccounts } from '@hooks/useLinkedAccounts/useLinkedAccounts'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'

export function LinkedAccountsProvider({ children }: PropsWithChildren) {
  const linkedAccountsContextData = useLinkedAccounts()

  return (
    <LinkedAccountsContext.Provider value={linkedAccountsContextData}>
      {children}
    </LinkedAccountsContext.Provider>
  )
}
