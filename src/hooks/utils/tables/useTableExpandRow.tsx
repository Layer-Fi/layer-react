import { useCallback, useContext } from 'react'

import { ReportsTableContext } from '@providers/reports/ReportsTableContext/ReportsTableContext'

export const useTableExpandRow = () => {
  const {
    expandAllRows,
    expandedRows,
    setExpandedRows,
  } = useContext(ReportsTableContext)

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
