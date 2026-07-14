import { useCallback, useMemo, useRef } from 'react'
import { fromDate, getLocalTimeZone, type ZonedDateTime } from '@internationalized/date'
import { revalidateLogic } from '@tanstack/react-form'
import { startOfToday } from 'date-fns'

import type { Classification } from '@schemas/categorization'
import type { Customer } from '@schemas/customer'
import type { NonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import type { Vendor } from '@schemas/vendor'
import { useCategorizeBankTransaction } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/categorize/useCategorizeBankTransaction'
import { useSetMetadataOnBankTransactionById } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/useSetMetadataOnBankTransaction'
import { useCreateCustomAccountTransactions } from '@hooks/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/useCreateCustomAccountTransactions'
import { useAppForm } from '@hooks/features/forms/useForm'
import { convertRecordTransactionFormToMetadataParams, convertRecordTransactionFormToParams } from '@components/BankTransactions/RecordManualTransaction/formUtils'
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
  const {
    trigger: createTransactions,
    isError: isCreateError,
    reset: resetCreate,
  } = useCreateCustomAccountTransactions({ swrOptions: { throwOnError: true } })
  const {
    trigger: setMetadata,
    isError: isMetadataError,
    reset: resetMetadata,
  } = useSetMetadataOnBankTransactionById()
  const {
    trigger: categorize,
    isError: isCategorizeError,
    reset: resetCategorize,
  } = useCategorizeBankTransaction()

  // Survives a failed follow-up call so retrying doesn't create a duplicate transaction.
  const createdTransactionIdRef = useRef<string | null>(null)

  const handleSubmit = useCallback(
    async ({ value, formApi }: { value: RecordTransactionFormValues, formApi: { reset: () => void } }) => {
      const params = convertRecordTransactionFormToParams(value, variant)
      if (params === null) return

      try {
        if (createdTransactionIdRef.current === null) {
          const [createdTransaction] = await createTransactions(params)
          if (createdTransaction === undefined) return
          createdTransactionIdRef.current = createdTransaction.id
        }
        const bankTransactionId = createdTransactionIdRef.current

        await setMetadata(convertRecordTransactionFormToMetadataParams(value, variant, bankTransactionId))
        if (value.category !== null) {
          await categorize({ bankTransactionId, type: 'Category', category: value.category })
        }

        createdTransactionIdRef.current = null
        onSuccess?.()
        formApi.reset()
      }
      catch (e) {
        console.error(e)
      }
    },
    [createTransactions, setMetadata, categorize, variant, onSuccess],
  )

  const form = useAppForm<RecordTransactionFormValues>({
    defaultValues: getDefaultValues(),
    onSubmit: handleSubmit,
    validationLogic: revalidateLogic(),
  })

  const isError = isCreateError || isMetadataError || isCategorizeError

  const resetSubmitState = useCallback(() => {
    resetCreate()
    resetMetadata()
    resetCategorize()
    createdTransactionIdRef.current = null
  }, [resetCreate, resetMetadata, resetCategorize])

  return useMemo(() => ({ form, isError, resetSubmitState }), [form, isError, resetSubmitState])
}
