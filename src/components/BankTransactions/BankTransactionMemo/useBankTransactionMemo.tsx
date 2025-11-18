import { useForm } from '@tanstack/react-form'
import { BankTransaction } from '@internal-types/bank_transactions'
import { useBankTransactionMetadata } from '@hooks/useBankTransactions/useBankTransactionsMetadata'
import { useUpdateBankTransactionMetadata } from '@hooks/useBankTransactions/useUpdateBankTransactionMetadata'

interface BankTransactionMemoProps {
  bankTransactionId: BankTransaction['id']
}

export const useBankTransactionMemo = ({ bankTransactionId }: BankTransactionMemoProps) => {
  const { trigger: updateBankTransactionMetadata } = useUpdateBankTransactionMetadata({ bankTransactionId })
  const { data: bankTransactionMetadata } = useBankTransactionMetadata({ bankTransactionId })

  const form = useForm({
    defaultValues: {
      memo: bankTransactionMetadata?.memo,
    },
    onSubmit: async ({ value }) => {
      if (value.memo !== undefined && form.state.isDirty) {
        await updateBankTransactionMetadata({ memo: value.memo ?? '' })
        form.reset(value)
      }
    },
  })

  return form
}
