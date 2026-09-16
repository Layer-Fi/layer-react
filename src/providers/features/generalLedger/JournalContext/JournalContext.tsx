import { createContext } from 'react'

import { type useJournal } from '@hooks/legacy/useJournal'

export type JournalContextType = ReturnType<typeof useJournal>
export const JournalContext = createContext<JournalContextType>({
  data: undefined,
  isLoading: false,
  isValidating: false,
  isError: false,
  refetch: () => Promise.resolve(undefined),
  setSelectedEntryId: () => {},
  closeSelectedEntry: () => {},
  hasMore: false,
  fetchMore: () => {},
  paginationProps: {},
})
