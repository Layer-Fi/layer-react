import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { del } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const REMOVE_TAG_FROM_BANK_TRANSACTION_TAG_KEY = '#remove-tag-from-bank-transaction'

type RemoveTagFromBankTransactionBody = {
  tag_ids: ReadonlyArray<string>
}

const removeTagFromBankTransaction = del<
  Record<string, never>,
  RemoveTagFromBankTransactionBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/bank-transactions/tags`)

const buildKey = createBuildKey<{ businessId: string, bankTransactionId: string }>([REMOVE_TAG_FROM_BANK_TRANSACTION_TAG_KEY])

type RemoveTagFromBankTransactionArg = {
  tagId: string
}

type RemoveTagFromBankTransactionOptions = {
  bankTransactionId: string
}

export function useRemoveTagFromBankTransaction({ bankTransactionId }: RemoveTagFromBankTransactionOptions) {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
      bankTransactionId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: { tagId } }: { arg: RemoveTagFromBankTransactionArg },
    ) => removeTagFromBankTransaction(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body: {
          tag_ids: [tagId],
        },
      },
    ),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

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
