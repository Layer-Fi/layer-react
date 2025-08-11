import { createContext, useContext, ReactNode } from 'react'
import { LedgerEntrySource } from '../types/ledger_accounts'
import { SourceLink } from '../types/utility/links'

interface LedgerEntrySourceContextType {
  convertToSourceLink?: (source: LedgerEntrySource) => SourceLink | undefined
}

const LedgerEntrySourceContext = createContext<LedgerEntrySourceContextType>({})

export const useLedgerEntrySourceContext = () => {
  return useContext(LedgerEntrySourceContext)
}

interface LedgerEntrySourceProviderProps {
  convertToSourceLink?: (source: LedgerEntrySource) => SourceLink | undefined
  children: ReactNode
}

export const LedgerEntrySourceProvider = ({
  convertToSourceLink,
  children,
}: LedgerEntrySourceProviderProps) => {
  return (
    <LedgerEntrySourceContext.Provider value={{ convertToSourceLink }}>
      {children}
    </LedgerEntrySourceContext.Provider>
  )
}
