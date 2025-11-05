import { useCallback, useContext } from 'react'
import { TableContext } from '../../contexts/TableContext/TableContext'

export const useTableExpandRow = () => {
  const {
    expandedAllRows,
    setExpandedAllRows,
    expandAllRows,
    expandedRows,
    setExpandedRows,
  } = useContext(TableContext)

  const setIsOpen = useCallback((
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
  }, [expandAllRows, expandedAllRows, setExpandedAllRows, setExpandedRows])

  const toggleAllRows = useCallback(() => {
    if (expandedAllRows) {
      setIsOpen([])
      return setExpandedAllRows(false)
    }
    else {
      return setExpandedAllRows(true)
    }
  }, [expandedAllRows, setExpandedAllRows, setIsOpen])

  const isOpen = useCallback((rowKey: string) => expandedRows.includes(rowKey), [expandedRows])

  return {
    isOpen,
    setIsOpen,
    expandedAllRows,
    toggleAllRows,
  }
}
