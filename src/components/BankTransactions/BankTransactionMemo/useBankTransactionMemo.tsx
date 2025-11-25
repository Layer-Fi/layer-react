import { useMemo } from 'react'
import { useForm } from '@tanstack/react-form'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { useBankTransactionMetadata } from '@hooks/useBankTransactions/useBankTransactionsMetadata'
import { useUpdateBankTransactionMetadata } from '@hooks/useBankTransactions/useUpdateBankTransactionMetadata'

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
