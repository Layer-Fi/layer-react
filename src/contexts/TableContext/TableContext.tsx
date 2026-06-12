import { createContext, type ReactNode, useCallback, useState } from 'react'

export interface TableContextProps {
  expandedRows: string[]
  setExpandedRows: (rowKey: string) => void
  expandAllRows: (rowKeys: string[]) => void
}

const defaultValue: TableContextProps = {
  expandedRows: [],
  setExpandedRows: () => {},
  expandAllRows: () => {},
}

export const TableContext = createContext<TableContextProps>(defaultValue)

interface TableProviderProps {
  children: ReactNode
}

export const TableProvider: React.FC<TableProviderProps> = ({ children }) => {
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

  const contextValue: TableContextProps = {
    expandedRows,
    setExpandedRows: toggleRow,
    expandAllRows,
  }

  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  )
}
