import { useCallback, useMemo } from 'react'
import { fromDate, getLocalTimeZone, type ZonedDateTime } from '@internationalized/date'
import { revalidateLogic } from '@tanstack/react-form'
import { startOfToday } from 'date-fns'

import { Direction } from '@internal-types/general'
import type { Classification } from '@schemas/categorization'
import type { Customer } from '@schemas/customer'
import { convertNonRecursiveBigDecimalToCents, type NonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import type { Vendor } from '@schemas/vendor'
import { useCreateCustomAccountTransactions } from '@hooks/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/useCreateCustomAccountTransactions'
import { useAppForm } from '@hooks/features/forms/useForm'
import type { AccountOption } from '@components/CustomAccountComboBox/AccountOption'
import { isNewAccountOption } from '@components/CustomAccountComboBox/utils'

export type RecordTransactionVariant = 'income' | 'expense'

export type RecordTransactionCounterparty = Customer | Vendor

export type RecordTransactionFormValues = {
  account: AccountOption | null
  counterparty: RecordTransactionCounterparty | null
  amount: NonRecursiveBigDecimal | null
  date: ZonedDateTime | null
  category: Classification | null
  memo: string
}

export type RecordTransactionFormApi = ReturnType<typeof useAppForm<RecordTransactionFormValues>>

const getDefaultValues = (): RecordTransactionFormValues => ({
  account: null,
  counterparty: null,
  amount: null,
  date: fromDate(startOfToday(), getLocalTimeZone()),
  category: null,
  memo: '',
})

type UseRecordTransactionFormProps = {
  variant: RecordTransactionVariant
  onSuccess?: () => void
}

export const useRecordTransactionForm = ({ variant, onSuccess }: UseRecordTransactionFormProps) => {
  const { trigger, isError } = useCreateCustomAccountTransactions()

  const handleSubmit = useCallback(
    async ({ value, formApi }: { value: RecordTransactionFormValues, formApi: { reset: () => void } }) => {
      const { account, amount, date, memo } = value
      if (account === null || isNewAccountOption(account) || amount === null || date === null) return

      const createdTransactions = await trigger({
        customAccountId: account.value,
        transactions: [{
          amount: convertNonRecursiveBigDecimalToCents(amount),
          direction: variant === 'expense' ? Direction.DEBIT : Direction.CREDIT,
          date: date.toDate().toISOString(),
          description: memo.trim(),
        }],
      })
      if (!createdTransactions) return

      onSuccess?.()
      formApi.reset()
    },
    [trigger, variant, onSuccess],
  )

  const form = useAppForm<RecordTransactionFormValues>({
    defaultValues: getDefaultValues(),
    onSubmit: handleSubmit,
    validationLogic: revalidateLogic(),
  })

  return useMemo(() => ({ form, isError }), [form, isError])
}
