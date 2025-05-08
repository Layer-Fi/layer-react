import { createContext } from 'react'
import { useQuickbooks } from '../../hooks/useQuickbooks'

export type QuickbooksContextType = ReturnType<typeof useQuickbooks>
export const QuickbooksContext = createContext<QuickbooksContextType>({
  linkQuickbooks: () => Promise.resolve(''),
  unlinkQuickbooks: () => {},
  syncFromQuickbooks: () => {},
  isSyncingFromQuickbooks: false,
  quickbooksIsConnected: false,
  quickbooksLastSyncedAt: undefined,
})