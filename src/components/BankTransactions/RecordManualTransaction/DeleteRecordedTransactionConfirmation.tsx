import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { useArchiveBankTransaction } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/useArchiveBankTransaction'
import { Button } from '@ui/Button/Button'
import { SubmitButton } from '@ui/Button/SubmitButton'
import { ModalActions, ModalContent, ModalDescription, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, Spacer } from '@ui/Stack/Stack'

type DeleteRecordedTransactionConfirmationProps = {
  transaction: BankTransaction
  onCancel: () => void
  onDeleted: () => void
}

// Rendered as a step inside the record modal (not a nested modal): cancelling returns to the form,
// confirming archives the transaction and closes the modal.
export function DeleteRecordedTransactionConfirmation({ transaction, onCancel, onDeleted }: DeleteRecordedTransactionConfirmationProps) {
  const { t } = useTranslation()
  const { trigger, isError } = useArchiveBankTransaction({ bankTransactionId: transaction.id })
  const [isProcessing, setIsProcessing] = useState(false)

  const onConfirm = useCallback(() => {
    setIsProcessing(true)
    void trigger()
      .then(onDeleted)
      .catch((e: unknown) => { console.error(e) })
      .finally(() => setIsProcessing(false))
  }, [trigger, onDeleted])

  return (
    <>
      <ModalTitleWithClose
        heading={<ModalHeading size='sm'>{t('bankTransactions:recordTransaction.delete.title', 'Delete transaction')}</ModalHeading>}
        onClose={onCancel}
      />
      <ModalContent>
        <ModalDescription>
          {t('bankTransactions:recordTransaction.delete.description', 'This transaction will be permanently deleted. This action cannot be undone.')}
        </ModalDescription>
      </ModalContent>
      <ModalActions>
        <HStack gap='sm'>
          <Spacer />
          <Button variant='outlined' onPress={onCancel} isDisabled={isProcessing}>
            {t('common:action.cancel_label', 'Cancel')}
          </Button>
          <SubmitButton
            onPress={onConfirm}
            isPending={isProcessing}
            isError={isError}
            withRetry
            noIcon
          >
            {isError
              ? t('common:action.retry_label', 'Retry')
              : t('common:action.delete_label', 'Delete')}
          </SubmitButton>
        </HStack>
      </ModalActions>
    </>
  )
}
