import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { Span } from '../../ui/Typography/Text'
import { Button } from '../../ui/Button/Button'
import { useCallback, useState } from 'react'
import pluralize from 'pluralize'
import { useCountSelectedIds, useSelectedIds, useBulkSelectionActions } from '../../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBulkUncategorize } from '../../../hooks/useBankTransactions/useBulkUncategorize'

export const BankTransactionsUncategorizeAllButton = () => {
  const { count } = useCountSelectedIds()
  const { selectedIds } = useSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const [isUnconfirmAllModalOpen, setIsUnconfirmAllModalOpen] = useState(false)
  const { trigger } = useBulkUncategorize()

  const handleUnconfirmAllClick = useCallback(() => {
    setIsUnconfirmAllModalOpen(true)
  }, [])

  const handleConfirm = useCallback(async () => {
    const transactionIds = Array.from(selectedIds)

    await trigger({ transactionIds })
    clearSelection()
  }, [selectedIds, trigger, clearSelection])

  return (
    <>
      <Button
        variant='solid'
        onClick={handleUnconfirmAllClick}
      >
        Uncategorize all
      </Button>
      <BaseConfirmationModal
        isOpen={isUnconfirmAllModalOpen}
        onOpenChange={setIsUnconfirmAllModalOpen}
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
      />
    </>
  )
}
