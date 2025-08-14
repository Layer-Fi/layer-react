import { createContext, useContext, ReactNode } from 'react'
import { SourceLink } from '../types/utility/links'
import { LedgerEntrySourceType } from '../schemas/ledgerEntrySourceSchemas'

interface LedgerEntrySourceContextType {
  convertToSourceLink?: (source: LedgerEntrySourceType) => SourceLink | undefined
}

const LedgerEntrySourceContext = createContext<LedgerEntrySourceContextType>({})

export const useLedgerEntrySourceContext = () => {
  return useContext(LedgerEntrySourceContext)
}

interface LedgerEntrySourceProviderProps {
  convertToSourceLink?: (source: LedgerEntrySourceType) => SourceLink | undefined
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
