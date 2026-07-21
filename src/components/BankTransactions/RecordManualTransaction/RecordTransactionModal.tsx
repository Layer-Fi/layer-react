import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { type BankTransactionCategorization } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { Button } from '@ui/Button/Button'
import { SubmitButton } from '@ui/Button/SubmitButton'
import { Modal } from '@ui/Modal/Modal'
import { ModalActions, ModalContent, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { getRecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/formUtils'
import { RecordTransactionForm } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionForm'
import { type RecordTransactionVariant, useRecordTransactionForm } from '@components/BankTransactions/RecordManualTransaction/useRecordTransactionForm'
import { isNewAccountOption } from '@components/CustomAccountComboBox/utils'

type RecordTransactionModalProps = {
  variant: RecordTransactionVariant
  transaction?: BankTransaction
  categorization?: BankTransactionCategorization
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function RecordTransactionModal({ variant, transaction, categorization, isOpen, onOpenChange }: RecordTransactionModalProps) {
  const { t } = useTranslation()

  const effectiveVariant = transaction ? getRecordTransactionVariant(transaction) : variant

  const onSuccess = useCallback(() => onOpenChange(false), [onOpenChange])

  const { form, isError, resetSubmitState } = useRecordTransactionForm({ variant: effectiveVariant, transaction, categorization, onSuccess })

  useEffect(() => {
    if (isOpen) resetSubmitState()
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
        <ModalTitleWithClose
          heading={<ModalHeading size='sm'>{title}</ModalHeading>}
          onClose={onCancel}
        />
        <ModalContent>
          <RecordTransactionForm
            form={form}
            variant={effectiveVariant}
            transaction={transaction}
            categorization={categorization}
          />
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
      </VStack>
    </Modal>
  )
}
