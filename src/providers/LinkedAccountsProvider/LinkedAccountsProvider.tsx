import { type PropsWithChildren } from 'react'

import { type PlaidHostedLinkConfig } from '@schemas/linkedAccounts/plaid'
import { useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'

type LinkedAccountsProviderProps = PropsWithChildren<{
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
}>

export function LinkedAccountsProvider({ children, plaidHostedLinkConfig }: LinkedAccountsProviderProps) {
  const linkedAccountsContextData = useLinkedAccounts({ plaidHostedLinkConfig })

  return (
    <LinkedAccountsContext.Provider value={linkedAccountsContextData}>
      {children}
    </LinkedAccountsContext.Provider>
  )
}
