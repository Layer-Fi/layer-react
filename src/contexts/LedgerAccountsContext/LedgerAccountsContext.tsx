import { createContext } from 'react'
import { useLedgerAccounts } from '@hooks/useLedgerAccounts/useLedgerAccounts'

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
  refetch: () => Promise.resolve(undefined),
  selectedAccount: undefined,
  setSelectedAccount: () => {},
  selectedEntryId: undefined,
  setSelectedEntryId: () => {},
  closeSelectedEntry: () => {},
  hasMore: false,
  fetchMore: () => {},
})
