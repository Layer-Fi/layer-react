import { createContext } from 'react'
import { useLinkedAccounts } from '@hooks/useLinkedAccounts/useLinkedAccounts'

export type LinkedAccountsContextType = ReturnType<typeof useLinkedAccounts>
export const LinkedAccountsContext = createContext<LinkedAccountsContextType>({
  data: undefined,
  isLoading: false,
  loadingStatus: 'initial',
  isValidating: false,
  error: undefined,
  updateConnectionStatus: () => Promise.resolve(),
  addConnection: () => Promise.resolve(),
  removeConnection: () => Promise.resolve(),
  repairConnection: () => Promise.resolve(),
  refetchAccounts: () => Promise.resolve(),
  unlinkAccount: () => Promise.resolve(),
  excludeAccount: () => Promise.resolve(),
  confirmAccount: () => Promise.resolve(),
  breakConnection: () => Promise.resolve(),
  syncAccounts: () => Promise.resolve(),
  accountsToAddOpeningBalanceInModal: [],
  setAccountsToAddOpeningBalanceInModal: () => {},
})
