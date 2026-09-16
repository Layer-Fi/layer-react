import { createContext, type ReactNode, useCallback, useState } from 'react'

export interface ReportsTableContextProps {
  expandedRows: string[]
  setExpandedRows: (rowKey: string) => void
  expandAllRows: (rowKeys: string[]) => void
}

const defaultValue: ReportsTableContextProps = {
  expandedRows: [],
  setExpandedRows: () => {},
  expandAllRows: () => {},
}

export const ReportsTableContext = createContext<ReportsTableContextProps>(defaultValue)

interface ReportsTableProviderProps {
  children: ReactNode
}

export const ReportsTableProvider: React.FC<ReportsTableProviderProps> = ({ children }) => {
  const [expandedRows, setExpandedRowsState] = useState<string[]>([])

  const toggleRow = useCallback((rowKey: string) => {
    setExpandedRowsState((prevRows) => {
      const rows = [...prevRows]
      if (rows.includes(rowKey)) {
        rows.splice(rows.indexOf(rowKey), 1)
      }
      else {
        rows.push(rowKey)
      }
      return rows
    })
  }, [])

  const expandAllRows = useCallback((rowKeys: string[]) => {
    setExpandedRowsState(rowKeys)
  }, [])

  const contextValue: ReportsTableContextProps = {
    expandedRows,
    setExpandedRows: toggleRow,
    expandAllRows,
  }

  return (
    <ReportsTableContext.Provider value={contextValue}>
      {children}
    </ReportsTableContext.Provider>
  )
}
