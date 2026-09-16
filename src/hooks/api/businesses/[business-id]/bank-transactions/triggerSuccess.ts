import { useBankTransactionsGlobalCacheActions } from '@api/businesses/[business-id]/bank-transactions/get'
import { useProfitAndLossGlobalInvalidator } from '@api/businesses/[business-id]/reports/profit-and-loss/useProfitAndLossGlobalInvalidator'

/**
 * Post-success side effects shared by every write that changes a bank transaction — recording,
 * archiving, and the bulk categorization endpoints. Reloads the list and invalidates P&L, since
 * a categorization moves money between accounts.
 *
 * Notifying the host app is deliberately not here: `onTransactionCategorized` comes from
 * LayerContext, which `@api` may not read. Feature wrappers add it via per-call `swrOptions`.
 */
export const useBankTransactionTriggerSuccess = () => {
  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  return () => {
    void forceReloadBankTransactions()

    void debouncedInvalidateProfitAndLoss()
  }
}
