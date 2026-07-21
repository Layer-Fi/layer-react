import { useCallback, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { Button } from '@ui/Button/Button'
import { SubmitButton } from '@ui/Button/SubmitButton'
import { Modal } from '@ui/Modal/Modal'
import { ModalActions, ModalContent, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { DeleteRecordedTransactionConfirmation } from '@components/BankTransactions/RecordManualTransaction/DeleteRecordedTransactionConfirmation'
import { getRecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/formUtils'
import { RecordTransactionForm } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionForm'
import { type RecordTransactionVariant, useRecordTransactionForm } from '@components/BankTransactions/RecordManualTransaction/useRecordTransactionForm'
import { isNewAccountOption } from '@components/CustomAccountComboBox/utils'

type RecordTransactionModalProps = {
  variant: RecordTransactionVariant
  transaction?: BankTransaction
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function RecordTransactionModal({ variant, transaction, isOpen, onOpenChange }: RecordTransactionModalProps) {
  const { t } = useTranslation()

  const effectiveVariant = transaction ? getRecordTransactionVariant(transaction) : variant

  const onSuccess = useCallback(() => onOpenChange(false), [onOpenChange])

  const { form, isError, resetSubmitState } = useRecordTransactionForm({ variant: effectiveVariant, transaction, onSuccess })

  // Delete is a step within this modal, not a stacked modal: the form is replaced by the
  // confirmation and restored on cancel. Reset to the form whenever the modal (re)opens.
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  useEffect(() => {
    if (isOpen) {
      resetSubmitState()
      setIsConfirmingDelete(false)
    }
  }, [isOpen, resetSubmitState])

  const onCancel = useCallback(() => {
    form.reset()
    onOpenChange(false)
  }, [form, onOpenChange])

  const title = transaction
    ? t('bankTransactions:recordTransaction.title.edit', 'Edit transaction')
    : effectiveVariant === 'expense'
      ? t('bankTransactions:recordTransaction.title.add_expense', 'Add expense')
      : t('bankTransactions:recordTransaction.title.add_income', 'Add income')

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='md' flexBlock>
      <VStack>
        {isConfirmingDelete && transaction
          ? (
            <DeleteRecordedTransactionConfirmation
              transaction={transaction}
              onCancel={() => setIsConfirmingDelete(false)}
              onDeleted={() => onOpenChange(false)}
            />
          )
          : (
            <>
              <ModalTitleWithClose
                heading={<ModalHeading size='sm'>{title}</ModalHeading>}
                onClose={onCancel}
              />
              <ModalContent>
                <RecordTransactionForm form={form} variant={effectiveVariant} transaction={transaction} />
              </ModalContent>
              <form.Subscribe
                selector={state => ({
                  isCreatingAccount: isNewAccountOption(state.values.account),
                  isSubmitting: state.isSubmitting,
                  canSubmit: state.canSubmit,
                })}
              >
                {({ isCreatingAccount, isSubmitting, canSubmit }) => isCreatingAccount
                  ? null
                  : (
                    <ModalActions>
                      <HStack gap='sm'>
                        {transaction && (
                          <Button variant='outlined' status='danger' onPress={() => setIsConfirmingDelete(true)}>
                            <HStack gap='3xs' align='center'>
                              <Trash2 size={14} />
                              {t('bankTransactions:recordTransaction.action.delete', 'Delete')}
                            </HStack>
                          </Button>
                        )}
                        <Spacer />
                        <Button variant='outlined' onPress={onCancel}>
                          {t('common:action.cancel_label', 'Cancel')}
                        </Button>
                        <SubmitButton
                          onPress={() => void form.handleSubmit()}
                          isPending={isSubmitting && canSubmit}
                          isError={isError}
                          withRetry
                          noIcon
                        >
                          {isError
                            ? t('common:action.retry_label', 'Retry')
                            : t('common:action.save_label', 'Save')}
                        </SubmitButton>
                      </HStack>
                    </ModalActions>
                  )}
              </form.Subscribe>
            </>
          )}
      </VStack>
    </Modal>
  )
}
