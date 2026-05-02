import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useSaveBankTransactionRow } from '@hooks/features/bankTransactions/useSaveBankTransactionRow'
import {
  type CategorizationSubmitError,
  getTransactionCategorizationSubmitErrorMessage,
  useGetBankTransactionCategorization,
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
  const { selectedCategorization } = useGetBankTransactionCategorization(bankTransaction.id)
  const { saveBankTransactionRow, isProcessing, isError } = useSaveBankTransactionRow()
  const [submitError, setSubmitError] = useState<CategorizationSubmitError | null>(null)

  const submit = useCallback(async (): Promise<boolean> => {
    const result = validateBankTransactionCategorizationForSubmit(selectedCategorization)
    if (!result.ok) {
      setSubmitError(result.error)
      return false
    }
    setSubmitError(null)
    await saveBankTransactionRow(result.value, bankTransaction, { notify })
    onSuccess?.()
    return true
  }, [bankTransaction, notify, onSuccess, saveBankTransactionRow, selectedCategorization])

  const clearError = useCallback(() => setSubmitError(null), [])

  const currentValidation = submitError
    ? validateBankTransactionCategorizationForSubmit(selectedCategorization)
    : null

  const activeSubmitError = currentValidation && !currentValidation.ok
    ? currentValidation.error
    : null

  const errorMessage = activeSubmitError
    ? getTransactionCategorizationSubmitErrorMessage(t, activeSubmitError)
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
