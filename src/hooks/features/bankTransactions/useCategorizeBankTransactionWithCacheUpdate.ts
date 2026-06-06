import { useCallback, useMemo } from 'react'

import type { BankTransaction } from '@internal-types/bankTransactions'
import type { CategoryUpdate } from '@schemas/bankTransactions/categoryUpdate'
import { useCategorizeBankTransaction } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/categorize/useCategorizeBankTransaction'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export function useCategorizeBankTransactionWithCacheUpdate() {
  const { eventCallbacks } = useLayerContext()
  const { updateLocalBankTransactions } = useBankTransactionsContext()

  const { trigger: categorizeBankTransaction, isMutating, isError } = useCategorizeBankTransaction()

  const categorize = useCallback(
    async (bankTransactionId: BankTransaction['id'], newCategory: CategoryUpdate, options?: { onSuccess?: () => void }): Promise<void> => {
      return categorizeBankTransaction({ bankTransactionId, ...newCategory })
        .then(
          (updatedTransaction) => {
            updateLocalBankTransactions([{
              ...updatedTransaction,
              recently_categorized: true,
            }])

            eventCallbacks?.onTransactionCategorized?.()

            options?.onSuccess?.()
          },
          () => {
            // Swallow the rejection; `isError`/`isMutating` drive the inline retry UI.
          },
        )
    },
    [updateLocalBankTransactions, categorizeBankTransaction, eventCallbacks],
  )

  return useMemo(
    () => ({ categorize, isMutating, isError }),
    [categorize, isMutating, isError],
  )
}
