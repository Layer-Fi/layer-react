import { createContext } from 'react'

import { type useLedgerAccounts } from '@hooks/legacy/useLedgerAccounts'

export type LedgerAccountsContextType = ReturnType<typeof useLedgerAccounts>
export const LedgerAccountsContext = createContext<LedgerAccountsContextType>({
  data: undefined,
  entryData: undefined,
  isLoading: false,
  isLoadingEntry: false,
  isValidating: false,
  isValidatingEntry: false,
  isError: false,
  isErrorEntry: false,
  refetch: () => Promise.resolve(undefined),
  selectedAccount: undefined,
  setSelectedAccount: () => {},
  selectedEntryId: undefined,
  setSelectedEntryId: () => {},
  closeSelectedEntry: () => {},
  hasMore: false,
  fetchMore: () => {},
})
