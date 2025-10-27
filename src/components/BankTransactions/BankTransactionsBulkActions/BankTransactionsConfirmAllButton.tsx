import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { Span } from '../../ui/Typography/Text'
import { Button } from '../../ui/Button/Button'
import { useCallback, useState } from 'react'
import pluralize from 'pluralize'
import { useCountSelectedIds, useBulkSelectionActions } from '../../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBulkMatchOrCategorize } from '../../../hooks/useBankTransactions/useBulkMatchOrCategorize'

export const BankTransactionsConfirmAllButton = () => {
  const { count } = useCountSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const [isConfirmAllModalOpen, setIsConfirmAllModalOpen] = useState(false)
  const { trigger, buildTransactionsPayload } = useBulkMatchOrCategorize()

  const handleConfirmAllClick = useCallback(() => {
    setIsConfirmAllModalOpen(true)
  }, [])

  const handleConfirm = useCallback(async () => {
    const payload = buildTransactionsPayload()
    await trigger(payload)
    clearSelection()
  }, [buildTransactionsPayload, trigger, clearSelection])

  return (
    <>
      <Button
        variant='solid'
        onClick={handleConfirmAllClick}
      >
        Confirm all
      </Button>
      <BaseConfirmationModal
        isOpen={isConfirmAllModalOpen}
        onOpenChange={setIsConfirmAllModalOpen}
        title='Confirm all suggestions?'
        content={(
          <Span>
            {`This action will confirm ${count} selected ${pluralize('transaction', count)}.`}
          </Span>
        )}
        onConfirm={handleConfirm}
        confirmLabel='Confirm All'
        cancelLabel='Cancel'
        errorText='Failed to confirm transactions'
        closeOnConfirm
      />
    </>
  )
}
