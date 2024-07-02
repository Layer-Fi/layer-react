import { useContext } from 'react'
import { TableContext } from '../../contexts/TableContext'

export const useTableExpandRow = () => {
  const { expandedRows, setExpandedRows } = useContext(TableContext)

  const setIsOpen = (rowKey: string) => {
    setExpandedRows(rowKey)
  }

  const isOpen = (rowKey: string) => expandedRows.includes(rowKey)

  return {
    isOpen,
    setIsOpen,
  }
}
