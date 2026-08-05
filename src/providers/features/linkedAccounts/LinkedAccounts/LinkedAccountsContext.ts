import { createContext } from 'react'

import { type useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'

export type LinkedAccountsContextType = ReturnType<typeof useLinkedAccounts>
export const LinkedAccountsContext = createContext<LinkedAccountsContextType>({
  isLinking: false,
  isHostedLinkError: false,
  addConnection: () => Promise.resolve(),
  removeConnection: () => Promise.resolve(),
  repairConnection: () => Promise.resolve(),
  refetchAccountsAndTransactions: () => Promise.resolve(),
  unlinkBankAccount: () => Promise.resolve(),
  excludeAccount: () => Promise.resolve(),
  confirmAccount: () => Promise.resolve(),
  breakConnection: () => Promise.resolve(),
})
