import { useCallback, useMemo } from 'react'
import { fromDate, getLocalTimeZone, type ZonedDateTime } from '@internationalized/date'
import { revalidateLogic } from '@tanstack/react-form'
import { startOfToday } from 'date-fns'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/bankTransactions'
import type { Classification } from '@schemas/categorization'
import type { NonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import { UpsertCustomAccountTransactionMode, useUpsertCustomAccountTransaction } from '@hooks/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/record/useRecordCustomAccountTransaction'
import { useAppForm } from '@hooks/features/forms/useForm'
import { useBankTransactionsCategorizationActions } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { convertApiCategorizationToCategoryOrSplitAsOption } from '@components/BankTransactionCategoryComboBox/utils'
import { convertRecordTransactionFormToParams, getRecordTransactionFormValues } from '@components/BankTransactions/RecordManualTransaction/formUtils'
import type { AccountOption } from '@components/CustomAccountComboBox/AccountOption'

export type RecordTransactionVariant = 'income' | 'expense'

export type RecordTransactionFormValues = {
  account: AccountOption | null
  description: string
  amount: NonRecursiveBigDecimal | null
  date: ZonedDateTime | null
  category: Classification | null
  taxCode: string | null
  memo: string
}

export type RecordTransactionFormApi = ReturnType<typeof useAppForm<RecordTransactionFormValues>>

const getDefaultValues = (): RecordTransactionFormValues => ({
  account: null,
  description: '',
  amount: null,
  date: fromDate(startOfToday(), getLocalTimeZone()),
  category: null,
  taxCode: null,
  memo: '',
})

type UseRecordTransactionFormProps = {
  variant: RecordTransactionVariant
  transaction?: BankTransaction
  onSuccess?: () => void
}

export const useRecordTransactionForm = ({ variant, transaction, onSuccess }: UseRecordTransactionFormProps) => {
  const { t } = useTranslation()
  const { addToast } = useLayerContext()
  const createExternalId = useMemo(() => crypto.randomUUID(), [])
  const { trigger, isError } = useUpsertCustomAccountTransaction(
    transaction
      ? { mode: UpsertCustomAccountTransactionMode.Update, transactionId: transaction.id }
      : { mode: UpsertCustomAccountTransactionMode.Create },
  )
  const { setTransactionCategorization, setTransactionTaxCodeSelection } = useBankTransactionsCategorizationActions()

  const handleSubmit = useCallback(
    async ({ value, formApi }: { value: RecordTransactionFormValues, formApi: { reset: () => void } }) => {
      const params = convertRecordTransactionFormToParams(value, variant)
      if (params === null) return

      const request = transaction
        ? params
        : { ...params, transaction: { ...params.transaction, externalId: createExternalId } }

      try {
        const updated = await trigger(request)

        // Keep the categorization store (which the row/table cells and this modal read) in sync with the saved edit.
        if (transaction && updated) {
          setTransactionCategorization(transaction.id, updated.category ? convertApiCategorizationToCategoryOrSplitAsOption(updated.category) : null)
          setTransactionTaxCodeSelection(transaction.id, updated.taxCode ?? null)
        }

        addToast({
          content: transaction
            ? t('bankTransactions:recordTransaction.toast.transaction_updated', 'Transaction updated')
            : t('bankTransactions:recordTransaction.toast.transaction_recorded', 'Transaction recorded'),
          type: 'success',
        })

        onSuccess?.()
        formApi.reset()
      }
      catch (e) {
        console.error(e)
      }
    },
    [trigger, variant, transaction, createExternalId, setTransactionCategorization, setTransactionTaxCodeSelection, addToast, t, onSuccess],
  )

  const form = useAppForm<RecordTransactionFormValues>({
    defaultValues: transaction ? getRecordTransactionFormValues(transaction) : getDefaultValues(),
    onSubmit: handleSubmit,
    validationLogic: revalidateLogic(),
  })

  return useMemo(() => ({ form, isError }), [form, isError])
}
