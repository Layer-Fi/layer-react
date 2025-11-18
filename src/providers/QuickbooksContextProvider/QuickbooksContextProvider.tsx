import { type PropsWithChildren } from 'react'
import { QuickbooksContext } from '@contexts/QuickbooksContext/QuickbooksContext'
import { useQuickbooks } from '@hooks/useQuickbooks/useQuickbooks'

export function QuickbooksContextProvider({ children }: PropsWithChildren) {
  const quickbooksContextData = useQuickbooks()

  return (
    <QuickbooksContext.Provider value={quickbooksContextData}>
      {children}
    </QuickbooksContext.Provider>
  )
}
