import { createContext } from 'react'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'

export type LinkedAccountsContextType = ReturnType<typeof useLinkedAccounts>
export const LinkedAccountsContext = createContext<LinkedAccountsContextType>({
  data: undefined,
  isLoading: false,
  loadingStatus: 'initial',
  isValidating: false,
  error: undefined,
  updateConnectionStatus: () => {},
  addConnection: () => {},
  removeConnection: () => {},
  repairConnection: () => {},
  refetchAccounts: () => {},
  unlinkAccount: () => {},
  denyAccount: () => {},
  confirmAccount: () => {},
  breakConnection: () => {},
  syncAccounts: () => {},
})
