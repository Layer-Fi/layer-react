import { createContext, useContext } from 'react'

import { type useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'

export type LinkedAccountsContextType = ReturnType<typeof useLinkedAccounts>

const UNPROVIDED_LINKED_ACCOUNTS_CONTEXT: LinkedAccountsContextType = {
  isLinking: false,
  isHostedLinkError: false,
  addConnection: () => Promise.resolve(false),
  removeConnection: () => Promise.resolve(),
  repairConnection: () => Promise.resolve(false),
  refetchAccountsAndTransactions: () => Promise.resolve(),
  unlinkBankAccount: () => Promise.resolve(),
  excludeAccount: () => Promise.resolve(),
  confirmAccount: () => Promise.resolve(),
  breakConnection: () => Promise.resolve(),
}

export const LinkedAccountsContext = createContext<LinkedAccountsContextType>(UNPROVIDED_LINKED_ACCOUNTS_CONTEXT)

export function useHasLinkedAccountsProvider(): boolean {
  return useContext(LinkedAccountsContext) !== UNPROVIDED_LINKED_ACCOUNTS_CONTEXT
}
