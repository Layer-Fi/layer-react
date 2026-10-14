import { type PropsWithChildren } from 'react'

import type { Awaitable } from '@internal-types/utility/awaitable'
import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { type PlaidHostedLinkConfig } from '@schemas/features/linkedAccounts/plaidHostedLinkConfig'
import { ConnectedAccountKeysProvider } from '@providers/features/linkedAccounts/LinkedAccounts/ConnectedAccountKeys'
import { LinkedAccountsContext } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'
import { useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'

type LinkedAccountsProviderProps = PropsWithChildren<{
  onPlaidConnectionSuccess?: () => Awaitable<void>
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
  customerManagedPlaidConfig?: CustomerManagedPlaidConfig
}>

export function LinkedAccountsProvider({
  children,
  onPlaidConnectionSuccess,
  plaidHostedLinkConfig,
  customerManagedPlaidConfig,
}: LinkedAccountsProviderProps) {
  const linkedAccountsContextData = useLinkedAccounts({
    onPlaidConnectionSuccess,
    plaidHostedLinkConfig,
    customerManagedPlaidConfig,
  })

  return (
    <LinkedAccountsContext.Provider value={linkedAccountsContextData}>
      <ConnectedAccountKeysProvider>
        {children}
      </ConnectedAccountKeysProvider>
    </LinkedAccountsContext.Provider>
  )
}
