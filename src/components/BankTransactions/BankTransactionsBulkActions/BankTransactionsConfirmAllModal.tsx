import { useCallback, useMemo } from 'react'
import pluralize from 'pluralize'

import { useBulkMatchOrCategorize } from '@hooks/useBankTransactions/useBulkMatchOrCategorize'
import { useBulkSelectionActions, useCountSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BaseConfirmationModal } from '@components/BaseConfirmationModal/BaseConfirmationModal'

interface BankTransactionsConfirmAllModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const BankTransactionsConfirmAllModal = ({ isOpen, onOpenChange }: BankTransactionsConfirmAllModalProps) => {
  const { count } = useCountSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const { trigger, buildTransactionsPayload } = useBulkMatchOrCategorize()

  const { actionableCount, skippedCount } = useMemo(() => {
    const payload = buildTransactionsPayload()
    const actionable = Object.keys(payload.transactions).length
    return {
      actionableCount: actionable,
      skippedCount: count - actionable,
    }
  }, [buildTransactionsPayload, count])

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
        <VStack gap='xs'>
          {skippedCount === 0
            ? (
              <Span>
                {`This will confirm ${pluralize('transaction', count, true)}.`}
              </Span>
            )
            : (
              <>
                <Span>
                  {`${actionableCount} of ${pluralize('transaction', count, true)} will be confirmed.`}
                </Span>
                <Span>
                  {`${pluralize('transaction', skippedCount, true)} will be skipped due to missing category.`}
                </Span>
              </>
            )}
        </VStack>
      )}
      onConfirm={handleConfirm}
      confirmLabel='Confirm All'
      cancelLabel='Cancel'
      errorText='Failed to confirm transactions'
      closeOnConfirm
      confirmDisabled={actionableCount === 0}
    />
  )
}
