import { useMemo, useCallback } from 'react'
import { useSelectedIds, useBulkSelectionActions } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { BankTransaction } from '../../types/bank_transactions'

export const useBankTransactionsTableCheckboxState = ({ bankTransactions }: { bankTransactions: BankTransaction[] | undefined }) => {
  const { selectedIds } = useSelectedIds()
  const { selectMultiple, deselectMultiple } = useBulkSelectionActions()

  const currentPageIds = useMemo(
    () => bankTransactions?.map(tx => tx.id) ?? [],
    [bankTransactions],
  )

  const selectedCount = useMemo(
    () => currentPageIds.filter(id => selectedIds.has(id)).length,
    [currentPageIds, selectedIds],
  )

  const isAllSelected = selectedCount > 0 && selectedCount === currentPageIds.length
  const isPartiallySelected = selectedCount > 0 && selectedCount < currentPageIds.length

  const onHeaderCheckboxChange = useCallback((checked: boolean) => {
    if (!checked || isPartiallySelected) {
      deselectMultiple(currentPageIds)
    }
    else {
      selectMultiple(currentPageIds)
    }
  }, [
    currentPageIds,
    isPartiallySelected,
    selectMultiple,
    deselectMultiple,
  ])

  return useMemo(() => ({
    isAllSelected,
    isPartiallySelected,
    onHeaderCheckboxChange,
  }), [isAllSelected, isPartiallySelected, onHeaderCheckboxChange])
}
