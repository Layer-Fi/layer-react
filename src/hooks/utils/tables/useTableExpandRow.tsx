import { useCallback, useContext } from 'react'

import { TableContext } from '@contexts/TableContext/TableContext'

export const useTableExpandRow = () => {
  const {
    expandAllRows,
    expandedRows,
    setExpandedRows,
  } = useContext(TableContext)

  const setIsOpen = useCallback((rowKey: string | string[]) => {
    if (Array.isArray(rowKey)) {
      return expandAllRows(rowKey)
    }
    return setExpandedRows(rowKey)
  }, [expandAllRows, setExpandedRows])

  const isOpen = useCallback((rowKey: string) => expandedRows.includes(rowKey), [expandedRows])

  return {
    isOpen,
    setIsOpen,
  }
}
