import React, { createContext, useState, ReactNode } from 'react'
import { TableContextProps } from '../../types/table'

const defaultValue: TableContextProps = {
  expandedRows: [],
  setExpandedRows: () => {},
  collapseRows: () => {},
}

export const TableContext = createContext<TableContextProps>(defaultValue)

interface TableProviderProps {
  children: ReactNode
}

export const TableProvider: React.FC<TableProviderProps> = ({ children }) => {
  const [expandedRows, setExpandedRowsState] = useState<string[]>([])

  const toggleRow = (rowKey: string) => {
    setExpandedRowsState(prevRows => {
      const rows = [...prevRows]
      if (rows.includes(rowKey)) {
        rows.splice(rows.indexOf(rowKey), 1)
      } else {
        rows.push(rowKey)
      }
      return rows
    })
  }

  const contextValue: TableContextProps = {
    expandedRows,
    setExpandedRows: toggleRow,
    collapseRows: () => setExpandedRowsState([]),
  }

  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  )
}
