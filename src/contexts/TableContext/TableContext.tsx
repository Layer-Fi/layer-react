import { createContext, useState, ReactNode, useCallback } from 'react'
import { TableContextProps } from '@internal-types/table'

const defaultValue: TableContextProps = {
  expandedRows: [],
  setExpandedRows: () => {},
  expandAllRows: () => {},
  expandedAllRows: false,
  setExpandedAllRows: () => {},
}

export const TableContext = createContext<TableContextProps>(defaultValue)

interface TableProviderProps {
  children: ReactNode
}

export const TableProvider: React.FC<TableProviderProps> = ({ children }) => {
  const [expandedRows, setExpandedRowsState] = useState<string[]>([])
  const [expandedAllRows, setExpandedAllRows] = useState(false)

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
    expandedAllRows,
    setExpandedAllRows,
  }

  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  )
}
