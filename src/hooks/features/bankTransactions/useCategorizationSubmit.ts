import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useSaveBankTransactionRow } from '@hooks/features/bankTransactions/useSaveBankTransactionRow'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import {
  type CategorizationSubmitError,
  getTransactionCategorizationSubmitErrorMessage,
  isSplitSubmitError,
  useBankTransactionsCategorizationActions,
  useGetBankTransactionCategorizationByTransactionId,
  validateBankTransactionCategorizationForSubmit,
} from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'

export type UseCategorizationSubmitOptions = {
  bankTransaction: BankTransaction
  onSuccess?: () => void
  notify?: boolean
}

export const useCategorizationSubmit = ({
  bankTransaction,
  onSuccess,
  notify,
}: UseCategorizationSubmitOptions) => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const { selectedCategorization } = useGetBankTransactionCategorizationByTransactionId(bankTransaction.id)
  const { setTransactionSplitFormErrorVisibility } = useBankTransactionsCategorizationActions()
  const { saveBankTransactionRow, isProcessing, isError } = useSaveBankTransactionRow()
  const [submitError, setSubmitError] = useState<CategorizationSubmitError | null>(null)

  const submit = useCallback(async (): Promise<boolean> => {
    const result = validateBankTransactionCategorizationForSubmit(selectedCategorization)
    if (!result.ok) {
      setSubmitError(result.error)
      setTransactionSplitFormErrorVisibility(bankTransaction.id, isSplitSubmitError(result.error))
      return false
    }
    setSubmitError(null)
    setTransactionSplitFormErrorVisibility(bankTransaction.id, false)
    await saveBankTransactionRow(result.value, bankTransaction, { notify })
    onSuccess?.()
    return true
  }, [bankTransaction, notify, onSuccess, saveBankTransactionRow, selectedCategorization, setTransactionSplitFormErrorVisibility])

  const clearError = useCallback(() => {
    setSubmitError(null)
    setTransactionSplitFormErrorVisibility(bankTransaction.id, false)
  }, [bankTransaction.id, setTransactionSplitFormErrorVisibility])

  const currentValidation = submitError
    ? validateBankTransactionCategorizationForSubmit(selectedCategorization)
    : null

  const activeSubmitError = currentValidation && !currentValidation.ok
    ? currentValidation.error
    : null

  const errorMessage = activeSubmitError
    ? getTransactionCategorizationSubmitErrorMessage(t, activeSubmitError, formatCurrencyFromCents(0))
    : null

  return {
    submit,
    submitError: activeSubmitError,
    errorMessage,
    isProcessing,
    isError,
    clearError,
  }
}
