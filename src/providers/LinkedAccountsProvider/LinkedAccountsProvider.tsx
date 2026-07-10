import { type PropsWithChildren } from 'react'

import type { Awaitable } from '@internal-types/utility/promises'
import { type PlaidHostedLinkConfig } from '@schemas/linkedAccounts/plaid'
import { useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'

type LinkedAccountsProviderProps = PropsWithChildren<{
  onPlaidConnectionSuccess?: () => Awaitable<void>
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
}>

export function LinkedAccountsProvider({
  children,
  onPlaidConnectionSuccess,
  plaidHostedLinkConfig,
}: LinkedAccountsProviderProps) {
  const linkedAccountsContextData = useLinkedAccounts({ onPlaidConnectionSuccess, plaidHostedLinkConfig })

  return (
    <LinkedAccountsContext.Provider value={linkedAccountsContextData}>
      {children}
    </LinkedAccountsContext.Provider>
  )
}
