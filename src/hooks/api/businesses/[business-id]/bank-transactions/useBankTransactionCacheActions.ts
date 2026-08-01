import { useBankTransactionsGlobalCacheActions } from '@api/businesses/[business-id]/bank-transactions/get'
import { useProfitAndLossGlobalInvalidator } from '@api/businesses/[business-id]/reports/profit-and-loss/useProfitAndLossGlobalInvalidator'

/** Post-success side effects for recording/updating a custom transaction: reload the list and invalidate P&L. */
export const useRecordTransactionTriggerSuccess = () => {
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()

  return () => {
    void forceReloadBankTransactions()

    void debouncedInvalidateProfitAndLoss()
  }
}

/** Post-success side effects for the bulk bank transaction categorization mutations. */
export const useBulkBankTransactionsTriggerSuccess = () => {
  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  return () => {
    void forceReloadBankTransactions()

    void debouncedInvalidateProfitAndLoss()
  }
}
