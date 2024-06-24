import React, { createContext, useState, ReactNode } from 'react'

interface TableExpandContextType {
  tableExpandState: boolean
  toggleTableExpandState: () => void
}

const defaultValue: TableExpandContextType = {
  tableExpandState: false,
  toggleTableExpandState: () => {},
}

export const TableExpandContext =
  createContext<TableExpandContextType>(defaultValue)

interface TableExpandProviderProps {
  children: ReactNode
}

export const TableExpandProvider: React.FC<TableExpandProviderProps> = ({
  children,
}) => {
  const [tableExpandState, setTableExpandState] = useState(true)

  const toggleTableExpandState = () => {
    setTableExpandState(prevState => !prevState)
  }

  return (
    <TableExpandContext.Provider
      value={{ tableExpandState, toggleTableExpandState }}
    >
      {children}
    </TableExpandContext.Provider>
  )
}
