import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { Modal } from '@ui/Modal/Modal'
import { ModalActions, ModalContent, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { RecordTransactionForm } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionForm'
import { type RecordTransactionFormValues, type RecordTransactionVariant, useRecordTransactionForm } from '@components/BankTransactions/RecordManualTransaction/useRecordTransactionForm'
import { isNewAccountOption } from '@components/CustomAccountComboBox/utils'

type RecordTransactionModalProps = {
  variant: RecordTransactionVariant
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function RecordTransactionModal({ variant, isOpen, onOpenChange }: RecordTransactionModalProps) {
  const { t } = useTranslation()

  const handleSubmit = useCallback((values: RecordTransactionFormValues) => {
    // TODO: wire up to the manual transaction API once the endpoint is available.
    console.warn('Record manual transaction submitted', { variant, values })
    onOpenChange(false)
  }, [variant, onOpenChange])

  const form = useRecordTransactionForm({ onSubmit: handleSubmit })

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
                  <Button onPress={() => void form.handleSubmit()} isPending={isSubmitting && canSubmit}>
                    {t('common:action.save_label', 'Save')}
                  </Button>
                </HStack>
              </ModalActions>
            )}
        </form.Subscribe>
      </VStack>
    </Modal>
  )
}
