import { createContext } from 'react'

import { type useQuickbooks } from '@hooks/useQuickbooks/useQuickbooks'

export type QuickbooksContextType = ReturnType<typeof useQuickbooks>
export const QuickbooksContext = createContext<QuickbooksContextType>({
  linkQuickbooks: () => Promise.reject(new Error('QuickbooksContext used without Provider')),
  unlinkQuickbooks: () => Promise.reject(new Error('QuickbooksContext used without Provider')),
  syncFromQuickbooks: () => { throw new Error('QuickbooksContext used without Provider') },
  quickbooksConnectionStatus: undefined,
})
