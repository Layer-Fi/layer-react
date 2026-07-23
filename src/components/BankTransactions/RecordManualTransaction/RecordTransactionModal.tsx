import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction, DisplayState } from '@internal-types/bankTransactions'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
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

import './recordTransactionModal.scss'

type RecordTransactionModalProps = {
  variant: RecordTransactionVariant
  transaction?: BankTransaction
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function RecordTransactionModal({ variant, transaction, isOpen, onOpenChange }: RecordTransactionModalProps) {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()

  const effectiveVariant = transaction ? getRecordTransactionVariant(transaction) : variant

  const { setFilters } = useBankTransactionsFiltersContext()
  const isCreating = transaction === undefined

  const onSuccess = useCallback(() => {
    // Land newly recorded transactions on the "Categorized" tab so the user can see the result.
    if (isCreating) {
      setFilters({ categorizationStatus: DisplayState.categorized })
    }
    onOpenChange(false)
  }, [isCreating, setFilters, onOpenChange])

  const { form, isError } = useRecordTransactionForm({ variant: effectiveVariant, transaction, onSuccess })

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='md' flexBlock variant={isMobile ? 'mobile-drawer' : 'center'}>
      <VStack pi={isMobile ? 'lg' : undefined} pb={isMobile ? 'lg' : undefined}>
        <div className={classNames('Layer__RecordTransactionModal__Step', isConfirmingDelete && 'Layer__RecordTransactionModal__Step--hidden')}>
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
                          {t('common:action.delete_label', 'Delete')}
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
        </div>
        {isConfirmingDelete && transaction && (
          <DeleteRecordedTransactionConfirmation
            transaction={transaction}
            onCancel={() => setIsConfirmingDelete(false)}
            onDeleted={() => onOpenChange(false)}
          />
        )}
      </VStack>
    </Modal>
  )
}
