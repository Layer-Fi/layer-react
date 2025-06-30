import { createContext } from 'react'
import { useLedgerAccounts } from '../../hooks/useLedgerAccounts'

export type LedgerAccountsContextType = ReturnType<typeof useLedgerAccounts>
export const LedgerAccountsContext = createContext<LedgerAccountsContextType>({
  data: undefined,
  entryData: undefined,
  isLoading: false,
  isLoadingEntry: false,
  isValidating: false,
  isValidatingEntry: false,
  error: undefined,
  errorEntry: undefined,
  refetch: () => {},
  accountId: undefined,
  setAccountId: () => {},
  selectedEntryId: undefined,
  setSelectedEntryId: () => {},
  closeSelectedEntry: () => {},
  hasMore: false,
  fetchMore: () => {},
})
