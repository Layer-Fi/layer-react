import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { Span } from '../../ui/Typography/Text'
import { useCallback } from 'react'
import pluralize from 'pluralize'
import { useCountSelectedIds, useBulkSelectionActions } from '../../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBulkMatchOrCategorize } from '../../../hooks/useBankTransactions/useBulkMatchOrCategorize'

interface BankTransactionsConfirmAllModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const BankTransactionsConfirmAllModal = ({ isOpen, onOpenChange }: BankTransactionsConfirmAllModalProps) => {
  const { count } = useCountSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const { trigger, buildTransactionsPayload } = useBulkMatchOrCategorize()

  const handleConfirm = useCallback(async () => {
    const payload = buildTransactionsPayload()
    await trigger(payload)
    clearSelection()
  }, [buildTransactionsPayload, trigger, clearSelection])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Confirm all suggestions?'
      content={(
        <Span>
          {`This will confirm ${count} selected ${pluralize('transaction', count)}.`}
        </Span>
      )}
      onConfirm={handleConfirm}
      confirmLabel='Confirm All'
      cancelLabel='Cancel'
      errorText='Failed to confirm transactions'
      closeOnConfirm
    />
  )
}
