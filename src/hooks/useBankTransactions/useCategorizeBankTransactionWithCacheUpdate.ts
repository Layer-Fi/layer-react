import { useCallback, useMemo } from 'react'

import type { BankTransaction } from '@internal-types/bank_transactions'
import type { CategoryUpdate } from '@schemas/bankTransactions/categoryUpdate'
import { useCategorizeBankTransaction } from '@hooks/useBankTransactions/useCategorizeBankTransaction'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export function useCategorizeBankTransactionWithCacheUpdate() {
  const { addToast, eventCallbacks } = useLayerContext()
  const { updateLocalBankTransactions } = useBankTransactionsContext()

  const { trigger: categorizeBankTransaction, isMutating, isError } = useCategorizeBankTransaction()

  const categorize = useCallback(
    async (bankTransactionId: BankTransaction['id'], newCategory: CategoryUpdate, notify?: boolean) => {
      return categorizeBankTransaction({ bankTransactionId, ...newCategory })
        .then((updatedTransaction) => {
          updateLocalBankTransactions([{
            ...updatedTransaction,
            recently_categorized: true,
          }])

          if (notify) {
            addToast({ content: 'Transaction confirmed' })
          }
        })
        .finally(() => {
          eventCallbacks?.onTransactionCategorized?.()
        })
    },
    [updateLocalBankTransactions, categorizeBankTransaction, addToast, eventCallbacks],
  )

  return useMemo(
    () => ({ categorize, isMutating, isError }),
    [categorize, isMutating, isError],
  )
}
