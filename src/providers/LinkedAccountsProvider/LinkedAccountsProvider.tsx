import { type PropsWithChildren } from 'react'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'
import { AccountConfirmationStoreProvider } from '../AccountConfirmationStoreProvider'

function InternalLinkedAccountsProvider({ children }: PropsWithChildren) {
  const linkedAccountsContextData = useLinkedAccounts()

  return (
    <LinkedAccountsContext.Provider value={linkedAccountsContextData}>
      {children}
    </LinkedAccountsContext.Provider>
  )
}

export const LinkedAccountsProvider = ({
  children,
}: PropsWithChildren) => {
  return (
    <AccountConfirmationStoreProvider>
      <InternalLinkedAccountsProvider>
        {children}
      </InternalLinkedAccountsProvider>
    </AccountConfirmationStoreProvider>
  )
}
