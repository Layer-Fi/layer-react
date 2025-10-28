import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { Span } from '../../ui/Typography/Text'
import { useCallback } from 'react'
import pluralize from 'pluralize'
import { useCountSelectedIds, useSelectedIds, useBulkSelectionActions } from '../../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBulkUncategorize } from '../../../hooks/useBankTransactions/useBulkUncategorize'

interface BankTransactionsUncategorizeAllModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const BankTransactionsUncategorizeAllModal = ({ isOpen, onOpenChange }: BankTransactionsUncategorizeAllModalProps) => {
  const { count } = useCountSelectedIds()
  const { selectedIds } = useSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const { trigger } = useBulkUncategorize()

  const handleConfirm = useCallback(async () => {
    const transactionIds = Array.from(selectedIds)

    await trigger({ transactionIds })
    clearSelection()
  }, [selectedIds, trigger, clearSelection])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Uncategorize all selected transactions?'
      content={(
        <Span>
          {`This action will uncategorize ${count} selected ${pluralize('transaction', count)}.`}
        </Span>
      )}
      onConfirm={handleConfirm}
      confirmLabel='Uncategorize All'
      cancelLabel='Cancel'
      errorText='Failed to uncategorize transactions'
    />
  )
}

