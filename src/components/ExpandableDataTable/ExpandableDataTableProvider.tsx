import { createContext, type PropsWithChildren, useMemo, useState } from 'react'
import type { ExpandedState } from '@tanstack/react-table'

export interface ExpandableDataTableContextType {
  expanded: ExpandedState
  setExpanded: React.Dispatch<React.SetStateAction<ExpandedState>>
}

const defaultContextValue: ExpandableDataTableContextType = {
  expanded: {},
  setExpanded: () => {},
}

export const ExpandableDataTableContext = createContext<ExpandableDataTableContextType>(defaultContextValue)
type ExpandableDataTableProviderProps = PropsWithChildren<{
  initialExpanded?: ExpandedState
}>

export function ExpandableDataTableProvider({ children, initialExpanded = {} }: ExpandableDataTableProviderProps) {
  const [expanded, setExpanded] = useState<ExpandedState>(initialExpanded)

  const value = useMemo(() => ({ expanded, setExpanded }), [expanded])

  return (
    <ExpandableDataTableContext.Provider value={value}>
      {children}
    </ExpandableDataTableContext.Provider>
  )
}
