import { useCallback, useMemo } from 'react'

import type { BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import type { CategoryUpdate } from '@schemas/bankTransactions/categoryUpdate'
import { usePutCategorizeBankTransaction } from '@api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/categorize/put'
import { useBankTransactionsGlobalCacheActions } from '@api/businesses/[business-id]/bank-transactions/get'
import { useProfitAndLossGlobalInvalidator } from '@api/businesses/[business-id]/reports/profit-and-loss/useProfitAndLossGlobalInvalidator'
import { useBankTransactionsContext } from '@providers/bankTransactions/BankTransactions/BankTransactionsContext'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'

export function useCategorizeBankTransactionWithCacheUpdate() {
  const { eventCallbacks } = useLayerContext()
  const { updateLocalBankTransactions, useBankTransactionsOptions } = useBankTransactionsContext()
  const { forceReloadBackgroundBankTransactions } = useBankTransactionsGlobalCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  const { trigger: categorizeBankTransaction, isMutating, isError } = usePutCategorizeBankTransaction()

  const categorize = useCallback(
    async (bankTransactionId: BankTransaction['id'], newCategory: CategoryUpdate, options?: { onSuccess?: () => void }): Promise<void> => {
      return categorizeBankTransaction({ bankTransactionId, ...newCategory })
        .then(
          (updatedTransaction) => {
            updateLocalBankTransactions([{
              ...updatedTransaction,
              recentlyCategorized: true,
            }])

            void forceReloadBackgroundBankTransactions(useBankTransactionsOptions)
            void debouncedInvalidateProfitAndLoss()

            eventCallbacks?.onTransactionCategorized?.()

            options?.onSuccess?.()
          },
          () => {
            // Swallow the rejection; `isError`/`isMutating` drive the inline retry UI.
          },
        )
    },
    [
      updateLocalBankTransactions,
      categorizeBankTransaction,
      eventCallbacks,
      forceReloadBackgroundBankTransactions,
      useBankTransactionsOptions,
      debouncedInvalidateProfitAndLoss,
    ],
  )

  return useMemo(
    () => ({ categorize, isMutating, isError }),
    [categorize, isMutating, isError],
  )
}
