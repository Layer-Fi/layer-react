import { createContext } from 'react'

import { type useJournal } from '@hooks/legacy/useJournal'

export type JournalContextType = ReturnType<typeof useJournal>
export const JournalContext = createContext<JournalContextType>({
  refetch: () => Promise.resolve(undefined),
  setSelectedEntryId: () => {},
  closeSelectedEntry: () => {},
  reverseEntry: () => Promise.resolve({}),
  hasMore: false,
  fetchMore: () => {},
})
