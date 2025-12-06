import { useCallback, useMemo } from 'react'
import pluralize from 'pluralize'

import { useBulkMatchOrCategorize } from '@hooks/useBankTransactions/useBulkMatchOrCategorize'
import { useBulkSelectionActions, useCountSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

interface BankTransactionsConfirmAllModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  isMobileView?: boolean
}

export const BankTransactionsConfirmAllModal = ({ isOpen, onOpenChange, isMobileView = false }: BankTransactionsConfirmAllModalProps) => {
  const { count } = useCountSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const { trigger, buildTransactionsPayload } = useBulkMatchOrCategorize()
  const payload = buildTransactionsPayload()

  const { actionableCount, skippedCount } = useMemo(() => {
    const actionable = Object.keys(payload.transactions).length
    return {
      actionableCount: actionable,
      skippedCount: count - actionable,
    }
  }, [payload, count])

  const handleConfirm = useCallback(async () => {
    await trigger(payload)
    clearSelection()
  }, [payload, trigger, clearSelection])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Confirm all suggestions?'
      content={(
        skippedCount === 0
          ? (
            <Span>
              {`This will confirm ${pluralize('transaction', count, true)}.`}
            </Span>
          )
          : (
            <VStack gap='xs'>
              <Span>
                {`${actionableCount} of ${pluralize('transaction', count, true)} will be confirmed.`}
              </Span>
              <Span>
                {`${pluralize('transaction', skippedCount, true)} will be skipped due to missing category.`}
              </Span>
            </VStack>
          )
      )}
      onConfirm={handleConfirm}
      confirmLabel='Confirm all'
      cancelLabel='Cancel'
      errorText='Failed to confirm transactions'
      closeOnConfirm
      confirmDisabled={actionableCount === 0}
      useDrawer={isMobileView}
    />
  )
}
