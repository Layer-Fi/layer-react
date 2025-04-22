import { useForm } from '@tanstack/react-form'
import { BankTransaction } from '../../../types'
import { useBankTransactionMetadata } from '../../../hooks/useBankTransactions/useBankTransactionsMetadata'
import { useUpdateBankTransactionMetadata } from '../../../hooks/useBankTransactions/useUpdateBankTransactionMetadata'

interface BankTransactionMemoProps {
  bankTransactionId: BankTransaction['id']
}

export const useBankTransactionMemo = ({ bankTransactionId }: BankTransactionMemoProps) => {
  const { trigger: updateBankTransactionMetadata } = useUpdateBankTransactionMetadata({ bankTransactionId })
  const { data: bankTransactionMetadata } = useBankTransactionMetadata({ bankTransactionId })

  return useForm({
    defaultValues: {
      memo: bankTransactionMetadata?.memo,
    },
    onSubmit: async ({ value }) => {
      if (value.memo !== undefined) {
        await updateBankTransactionMetadata({ memo: value.memo ?? '' })
      }
    },
  })
}
