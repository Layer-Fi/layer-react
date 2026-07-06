import { useCallback } from 'react'

import { del } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const REMOVE_TAG_FROM_BANK_TRANSACTION_TAG_KEY = '#remove-tag-from-bank-transaction'

type RemoveTagFromBankTransactionBody = {
  tag_ids: ReadonlyArray<string>
}

const removeTagFromBankTransaction = del<
  Record<string, never>,
  RemoveTagFromBankTransactionBody,
  { businessId: string, bankTransactionId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/bank-transactions/tags`)

type RemoveTagFromBankTransactionArg = {
  tagId: string
}

const useRemoveTagFromBankTransactionMutation = createMutationHook({
  tags: [REMOVE_TAG_FROM_BANK_TRANSACTION_TAG_KEY],
  request: removeTagFromBankTransaction,
  keyParams: ['bankTransactionId'],
  argToBody: ({ tagId }: RemoveTagFromBankTransactionArg) => ({
    tag_ids: [tagId],
  }),
  swrOptions: { throwOnError: false },
})

type RemoveTagFromBankTransactionOptions = {
  bankTransactionId: string
}

export function useRemoveTagFromBankTransaction({ bankTransactionId }: RemoveTagFromBankTransactionOptions) {
  const mutationResponse = useRemoveTagFromBankTransactionMutation({ bankTransactionId })

  const { optimisticallyUpdateBankTransactions, debouncedInvalidateBankTransactions } = useBankTransactionsGlobalCacheActions()

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResultPromise = originalTrigger(...triggerParameters)

      void optimisticallyUpdateBankTransactions((bankTransaction) => {
        if (bankTransaction.id === bankTransactionId) {
          const { tagId } = triggerParameters[0]

          return {
            ...bankTransaction,
            transactionTags: bankTransaction.transactionTags.filter(
              tag => tag.id !== tagId,
            ),
          }
        }

        return bankTransaction
      })

      return triggerResultPromise
        .finally(() => {
          void debouncedInvalidateBankTransactions({
            withPrecedingOptimisticUpdate: true,
          })
        })
    },
    [
      bankTransactionId,
      originalTrigger,
      optimisticallyUpdateBankTransactions,
      debouncedInvalidateBankTransactions,
    ],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
