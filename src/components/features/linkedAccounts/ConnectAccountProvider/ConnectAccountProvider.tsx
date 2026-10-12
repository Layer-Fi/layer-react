import { type PropsWithChildren, useCallback, useContext } from 'react'

import { ConnectAccountContext } from '@providers/features/bookkeeping/ConnectAccountContext/ConnectAccountContext'
import {
  AccountConfirmationStoreProvider,
  useHasAccountConfirmationStoreProvider,
} from '@providers/features/linkedAccounts/AccountConfirmationStore/AccountConfirmationStoreProvider'
import { LinkedAccountsContext, useHasLinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'
import { LinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsProvider'

const LinkedAccountsConnectAccountProvider = ({ children }: PropsWithChildren) => {
  const { addConnection } = useContext(LinkedAccountsContext)

  const connectAccount = useCallback(
    () => new Promise<boolean>((resolve) => {
      void addConnection('PLAID', { onComplete: resolve })
    }),
    [addConnection],
  )

  return (
    <ConnectAccountContext.Provider value={connectAccount}>
      {children}
    </ConnectAccountContext.Provider>
  )
}

export const ConnectAccountProvider = ({ children }: PropsWithChildren) => {
  const hasAccountConfirmationStoreProvider = useHasAccountConfirmationStoreProvider()
  const hasLinkedAccountsProvider = useHasLinkedAccountsProvider()

  const connectAccount = <LinkedAccountsConnectAccountProvider>{children}</LinkedAccountsConnectAccountProvider>
  const linkedAccounts = hasLinkedAccountsProvider
    ? connectAccount
    : <LinkedAccountsProvider>{connectAccount}</LinkedAccountsProvider>

  if (hasAccountConfirmationStoreProvider) {
    return linkedAccounts
  }

  return <AccountConfirmationStoreProvider>{linkedAccounts}</AccountConfirmationStoreProvider>
}
