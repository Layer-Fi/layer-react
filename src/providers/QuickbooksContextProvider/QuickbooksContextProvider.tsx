import { type PropsWithChildren } from 'react'

import { useQuickbooks } from '@hooks/features/quickbooks/useQuickbooks'
import { QuickbooksContext } from '@contexts/QuickbooksContext/QuickbooksContext'

export function QuickbooksContextProvider({ children }: PropsWithChildren) {
  const quickbooksContextData = useQuickbooks()

  return (
    <QuickbooksContext.Provider value={quickbooksContextData}>
      {children}
    </QuickbooksContext.Provider>
  )
}
