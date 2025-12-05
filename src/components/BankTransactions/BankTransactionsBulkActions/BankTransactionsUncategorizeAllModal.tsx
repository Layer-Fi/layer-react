import { useCallback } from 'react'
import pluralize from 'pluralize'

import { useBulkUncategorize } from '@hooks/useBankTransactions/useBulkUncategorize'
import { useBankTransactionsCategoryActions } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { useBulkSelectionActions, useCountSelectedIds, useSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { Span } from '@ui/Typography/Text'
import { ResponsiveConfirmationModal } from '@components/ConfirmationModal/ResponsiveConfirmationModal/ResponsiveConfirmationModal'

interface BankTransactionsUncategorizeAllModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  isMobileView?: boolean
}

export const BankTransactionsUncategorizeAllModal = ({ isOpen, onOpenChange, isMobileView = false }: BankTransactionsUncategorizeAllModalProps) => {
  const { count } = useCountSelectedIds()
  const { selectedIds } = useSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const { trigger } = useBulkUncategorize()
  const { clearMultipleTransactionCategories } = useBankTransactionsCategoryActions()

  const handleConfirm = useCallback(async () => {
    const transactionIds = Array.from(selectedIds)

    await trigger({ transactionIds })
    clearMultipleTransactionCategories(transactionIds)
    clearSelection()
  }, [selectedIds, trigger, clearSelection, clearMultipleTransactionCategories])

  return (
    <ResponsiveConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Uncategorize all selected transactions?'
      content={(
        <Span>
          {`This will uncategorize ${count} selected ${pluralize('transaction', count)}.`}
        </Span>
      )}
      onConfirm={handleConfirm}
      confirmLabel='Uncategorize All'
      cancelLabel='Cancel'
      errorText='Failed to uncategorize transactions'
      useDrawer={isMobileView}
    />
  )
}
