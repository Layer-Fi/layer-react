import { useMemo } from 'react'
import { useForm } from '@tanstack/react-form'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { usePatchBankTransactionMemo } from '@api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/patch'
import { useBankTransactionsGlobalCacheActions } from '@api/businesses/[business-id]/bank-transactions/get'

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
  } = usePatchBankTransactionMemo({ bankTransactionId })
  const { patchBankTransactionsByTransformation } = useBankTransactionsGlobalCacheActions()
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.BankTransactions)

  const form = useForm({
    defaultValues: {
      memo,
    },
    onSubmit: async ({ value }) => {
      if (value.memo !== undefined && form.state.isDirty) {
        const result = await updateBankTransactionMetadata({ memo: value.memo ?? '' })

        if (result !== undefined) {
          void patchBankTransactionsByTransformation(bankTransaction =>
            bankTransaction.id === bankTransactionId ? { ...bankTransaction, memo: value.memo ?? null } : bankTransaction)

          emitLayerEvent({
            type: LayerEventType.TransactionDescriptionEntered,
            version: 1,
            payload: { transactionId: bankTransactionId },
          })

          form.reset(value)
        }
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
