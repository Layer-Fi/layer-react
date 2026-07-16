import { useCallback, useMemo } from 'react'
import { fromDate, getLocalTimeZone, type ZonedDateTime } from '@internationalized/date'
import { revalidateLogic } from '@tanstack/react-form'
import { startOfToday } from 'date-fns'

import type { Classification } from '@schemas/categorization'
import type { Customer } from '@schemas/customer'
import type { NonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import type { Vendor } from '@schemas/vendor'
import { useRecordCustomAccountTransaction } from '@hooks/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/record/useRecordCustomAccountTransaction'
import { useAppForm } from '@hooks/features/forms/useForm'
import { convertRecordTransactionFormToParams } from '@components/BankTransactions/RecordManualTransaction/formUtils'
import type { AccountOption } from '@components/CustomAccountComboBox/AccountOption'

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
  const { trigger, isError, reset: resetSubmitState } = useRecordCustomAccountTransaction()

  const handleSubmit = useCallback(
    async ({ value, formApi }: { value: RecordTransactionFormValues, formApi: { reset: () => void } }) => {
      const params = convertRecordTransactionFormToParams(value, variant)
      if (params === null) return

      try {
        await trigger(params)
        onSuccess?.()
        formApi.reset()
      }
      catch (e) {
        console.error(e)
      }
    },
    [trigger, variant, onSuccess],
  )

  const form = useAppForm<RecordTransactionFormValues>({
    defaultValues: getDefaultValues(),
    onSubmit: handleSubmit,
    validationLogic: revalidateLogic(),
  })

  return useMemo(() => ({ form, isError, resetSubmitState }), [form, isError, resetSubmitState])
}
