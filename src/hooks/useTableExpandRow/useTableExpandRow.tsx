import { useContext } from 'react'
import { TableContext } from '../../contexts/TableContext'

export const useTableExpandRow = () => {
  const {
    expandedAllRows,
    setExpandedAllRows,
    expandAllRows,
    expandedRows,
    setExpandedRows,
  } = useContext(TableContext)

  const toggleAllRows = () => {
    if (expandedAllRows) {
      setIsOpen([])
      return setExpandedAllRows(false)
    } else {
      return setExpandedAllRows(true)
    }
  }

  const setIsOpen = (
    rowKey: string | string[],
    withoutAllRowsUpdate?: boolean,
  ) => {
    if (!withoutAllRowsUpdate && expandedAllRows) {
      setExpandedAllRows(false)
    }
    if (Array.isArray(rowKey)) {
      return expandAllRows(rowKey)
    }
    return setExpandedRows(rowKey)
  }

  const isOpen = (rowKey: string) => expandedRows.includes(rowKey)

  return {
    isOpen,
    setIsOpen,
    expandedAllRows,
    toggleAllRows,
  }
}
