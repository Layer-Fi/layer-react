import { createContext, useContext, useMemo, type PropsWithChildren } from 'react'

export type BankTransactionsMode = 'bookkeeping-client' | 'self-serve'

type LegacyModeShape = {
  overrideMode?: BankTransactionsMode
}

const LegacyModeContext = createContext<LegacyModeShape>({
  overrideMode: undefined,
})

export function useLegacyMode() {
  return useContext(LegacyModeContext)
}

export function LegacyModeProvider({
  overrideMode,
  children,
}: PropsWithChildren<LegacyModeShape>) {
  const memoizedValue = useMemo(() => ({ overrideMode }), [overrideMode])

  return (
    <LegacyModeContext.Provider value={memoizedValue}>
      {children}
    </LegacyModeContext.Provider>
  )
}
