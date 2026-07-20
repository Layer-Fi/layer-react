import { useMemo } from 'react'
import { useForm } from '@tanstack/react-form'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useUpdateBankTransactionMetadata } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/useUpdateBankTransactionMetadata'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useEmitLayerEvent } from '@hooks/useEmitLayerEvent'
import { LayerEventComponent, LayerEventType } from '@providers/LayerProvider/layerEvents'

interface BankTransactionMemoProps {
  bankTransactionId: BankTransaction['id']
  memo: BankTransaction['memo']
}

export const useBankTransactionMemo = ({ bankTransactionId, memo }: BankTransactionMemoProps) => {
  const {
    trigger: updateBankTransactionMetadata,
    isMutating: isUpdatingMemo,
    isError: isErrorUpdatingMemo,
    data: updateResult,
  } = useUpdateBankTransactionMetadata({ bankTransactionId })
  const { optimisticallyUpdateBankTransactions, debouncedInvalidateBankTransactions } = useBankTransactionsGlobalCacheActions()
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.BankTransactions)

  const form = useForm({
    defaultValues: {
      memo,
    },
    onSubmit: async ({ value }) => {
      if (value.memo !== undefined && form.state.isDirty) {
        void optimisticallyUpdateBankTransactions(bankTransaction =>
          bankTransaction.id === bankTransactionId ? { ...bankTransaction, memo: value.memo ?? null } : bankTransaction)

        const result = await updateBankTransactionMetadata({ memo: value.memo ?? '' })

        if (result !== undefined) {
          emitLayerEvent({
            type: LayerEventType.TransactionDescriptionEntered,
            version: 1,
            payload: { transactionId: bankTransactionId },
          })

          form.reset(value)
        }

        void debouncedInvalidateBankTransactions({ withPrecedingOptimisticUpdate: true })
      }
    },
  })

  const isSaved = !isUpdatingMemo && !isErrorUpdatingMemo && updateResult !== undefined && !form.state.isDirty

  return useMemo(() => ({
    form,
    isUpdatingMemo,
    isErrorUpdatingMemo,
    isSaved,
  }), [form, isErrorUpdatingMemo, isUpdatingMemo, isSaved])
}
