import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { SubmitButton } from '@ui/Button/SubmitButton'
import { Modal } from '@ui/Modal/Modal'
import { ModalActions, ModalContent, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { RecordTransactionForm } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionForm'
import { type RecordTransactionVariant, useRecordTransactionForm } from '@components/BankTransactions/RecordManualTransaction/useRecordTransactionForm'
import { isNewAccountOption } from '@components/CustomAccountComboBox/utils'

type RecordTransactionModalProps = {
  variant: RecordTransactionVariant
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function RecordTransactionModal({ variant, isOpen, onOpenChange }: RecordTransactionModalProps) {
  const { t } = useTranslation()

  const onSuccess = useCallback(() => onOpenChange(false), [onOpenChange])

  const { form, isError } = useRecordTransactionForm({ variant, onSuccess })

  const onCancel = useCallback(() => {
    form.reset()
    onOpenChange(false)
  }, [form, onOpenChange])

  const title = variant === 'expense'
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
          <RecordTransactionForm form={form} variant={variant} />
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
