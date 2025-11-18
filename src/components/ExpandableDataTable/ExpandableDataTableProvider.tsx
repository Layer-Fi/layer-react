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
export function ExpandableDataTableProvider({ children }: PropsWithChildren) {
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const value = useMemo(() => ({ expanded, setExpanded }), [expanded])

  return (
    <ExpandableDataTableContext.Provider value={value}>
      {children}
    </ExpandableDataTableContext.Provider>
  )
}
