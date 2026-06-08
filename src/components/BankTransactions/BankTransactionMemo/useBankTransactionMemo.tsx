import { useMemo } from 'react'
import { useForm } from '@tanstack/react-form'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useBankTransactionMetadata } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/useBankTransactionsMetadata'
import { useUpdateBankTransactionMetadata } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/useUpdateBankTransactionMetadata'
import { useEmitLayerEvent } from '@hooks/useEmitLayerEvent'
import { LayerEventComponent, LayerEventType } from '@providers/LayerProvider/layerEvents'

interface BankTransactionMemoProps {
  bankTransactionId: BankTransaction['id']
}

export const useBankTransactionMemo = ({ bankTransactionId }: BankTransactionMemoProps) => {
  const {
    trigger: updateBankTransactionMetadata,
    isMutating: isUpdatingMemo,
    isError: isErrorUpdatingMemo,
    data: updateResult,
  } = useUpdateBankTransactionMetadata({ bankTransactionId })
  const { data: bankTransactionMetadata, mutate: mutateBankTransactionMetadata } = useBankTransactionMetadata({ bankTransactionId })
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.BankTransactions)

  const form = useForm({
    defaultValues: {
      memo: bankTransactionMetadata?.memo,
    },
    onSubmit: async ({ value }) => {
      if (value.memo !== undefined && form.state.isDirty) {
        const result = await mutateBankTransactionMetadata(
          updateBankTransactionMetadata({ memo: value.memo ?? '' }),
          { optimisticData: { memo: value.memo ?? '' }, revalidate: false },
        )

        if (result !== undefined) {
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
