import { useCallback } from 'react'
import { fromDate, getLocalTimeZone, type ZonedDateTime } from '@internationalized/date'
import { revalidateLogic } from '@tanstack/react-form'
import { startOfToday } from 'date-fns'

import type { Classification } from '@schemas/categorization'
import type { Customer } from '@schemas/customer'
import type { NonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import type { Vendor } from '@schemas/vendor'
import { useAppForm } from '@hooks/features/forms/useForm'
import type { AccountOption } from '@components/CustomAccountComboBox/CustomAccountComboBox'

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
  onSubmit: (values: RecordTransactionFormValues) => void | Promise<void>
}

export const useRecordTransactionForm = ({ onSubmit }: UseRecordTransactionFormProps) => {
  const handleSubmit = useCallback(
    async ({ value, formApi }: { value: RecordTransactionFormValues, formApi: { reset: () => void } }) => {
      await onSubmit(value)
      formApi.reset()
    },
    [onSubmit],
  )

  return useAppForm<RecordTransactionFormValues>({
    defaultValues: getDefaultValues(),
    onSubmit: handleSubmit,
    validationLogic: revalidateLogic(),
  })
}
