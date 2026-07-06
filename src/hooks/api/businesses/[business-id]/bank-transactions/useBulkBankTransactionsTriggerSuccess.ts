import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

/** Shared post-success side effects for the bulk bank transaction categorization mutations. */
export const useBulkBankTransactionsTriggerSuccess = () => {
  const { eventCallbacks } = useLayerContext()

  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  return () => {
    void forceReloadBankTransactions()

    void debouncedInvalidateProfitAndLoss()

    eventCallbacks?.onTransactionCategorized?.()
  }
}
