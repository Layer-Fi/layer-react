import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'

/** Shared post-success side effects for single bank transaction categorize/match mutations. */
export const useBankTransactionTriggerSuccess = () => {
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { useBankTransactionsOptions } = useBankTransactionsContext()
  const { forceReloadBackgroundBankTransactions } = useBankTransactionsGlobalCacheActions()

  return () => {
    void forceReloadBackgroundBankTransactions(useBankTransactionsOptions)

    void debouncedInvalidateProfitAndLoss()
  }
}

/** Post-success side effects for recording/updating a custom transaction: reload the list and invalidate P&L. */
export const useRecordTransactionTriggerSuccess = () => {
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()

  return () => {
    void forceReloadBankTransactions()

    void debouncedInvalidateProfitAndLoss()
  }
}
