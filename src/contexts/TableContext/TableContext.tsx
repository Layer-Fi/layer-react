import React, { createContext, useState, ReactNode } from 'react'
import { TableContextProps } from '../../types/table'

const defaultValue: TableContextProps = {
  tableState: false,
  toggleTableState: () => {},
}

export const TableContext = createContext<TableContextProps>(defaultValue)

interface TableProviderProps {
  children: ReactNode
}

export const TableProvider: React.FC<TableProviderProps> = ({ children }) => {
  const [tableState, setTableState] = useState(true)

  const toggleTableState = () => {
    setTableState(prevState => !prevState)
  }

  return (
    <TableContext.Provider value={{ tableState, toggleTableState }}>
      {children}
    </TableContext.Provider>
  )
}
