import { useCallback, useMemo } from 'react'
import { type CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import { revalidateLogic } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/bankTransactions'
import type { Classification } from '@schemas/categorization/classification'
import type { NonRecursiveBigDecimal } from '@schemas/common/nonRecursiveBigDecimal'
import { convertApiCategorizationToCategoryOrSplitAsOption } from '@utils/features/bankTransactions/categorizationOption'
import { useUpsertCustomAccountTransaction } from '@api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/record/upsert'
import { useAppForm } from '@hooks/features/forms/useForm'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import { useBankTransactionsCategorizationActions } from '@providers/categorization/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { convertRecordBankTransactionFormToParams, getRecordBankTransactionFormValues } from '@features/bankTransactions/RecordBankTransactionForm/formUtils'
import type { AccountOption } from '@features/customAccounts/CustomAccountComboBox/AccountOption'

export type RecordBankTransactionVariant = 'income' | 'expense'

export type RecordBankTransactionFormValues = {
  account: AccountOption | null
  description: string
  amount: NonRecursiveBigDecimal | null
  date: CalendarDate | null
  category: Classification | null
  taxCode: string | null
  memo: string
}

export type RecordBankTransactionFormApi = ReturnType<typeof useAppForm<RecordBankTransactionFormValues>>

const getDefaultValues = (): RecordBankTransactionFormValues => ({
  account: null,
  description: '',
  amount: null,
  date: today(getLocalTimeZone()),
  category: null,
  taxCode: null,
  memo: '',
})

type UseRecordBankTransactionFormProps = {
  variant: RecordBankTransactionVariant
  transaction?: BankTransaction
  onSuccess?: () => void
}

export const useRecordBankTransactionForm = ({ variant, transaction, onSuccess }: UseRecordBankTransactionFormProps) => {
  const { t } = useTranslation()
  const { addToast } = useLayerContext()
  const createExternalId = useMemo(() => crypto.randomUUID(), [])
  const { trigger, isError } = useUpsertCustomAccountTransaction(
    transaction
      ? { mode: UpsertMode.Update, transactionId: transaction.id }
      : { mode: UpsertMode.Create },
  )
  const { setTransactionCategorization, setTransactionTaxCodeSelection } = useBankTransactionsCategorizationActions()

  const handleSubmit = useCallback(
    async ({ value, formApi }: { value: RecordBankTransactionFormValues, formApi: { reset: () => void } }) => {
      const params = convertRecordBankTransactionFormToParams(value, variant)
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

  const form = useAppForm<RecordBankTransactionFormValues>({
    defaultValues: transaction ? getRecordBankTransactionFormValues(transaction) : getDefaultValues(),
    onSubmit: handleSubmit,
    validationLogic: revalidateLogic(),
  })

  return useMemo(() => ({ form, isError }), [form, isError])
}
