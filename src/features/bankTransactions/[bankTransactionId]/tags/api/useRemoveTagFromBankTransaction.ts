import useSWRMutation from 'swr/mutation'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useCallback } from 'react'
import { del } from '@api/layer/authenticated_http'
import { useBankTransactionsGlobalCacheActions } from '@hooks/useBankTransactions/useBankTransactions'

const REMOVE_TAG_FROM_BANK_TRANSACTION_TAG_KEY = '#remove-tag-from-bank-transaction'

type RemoveTagFromBankTransactionBody = {
  tag_ids: ReadonlyArray<string>
}

const removeTagFromBankTransaction = del<
  Record<string, never>,
  RemoveTagFromBankTransactionBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/bank-transactions/tags`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  bankTransactionId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  bankTransactionId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      bankTransactionId,
      tags: [REMOVE_TAG_FROM_BANK_TRANSACTION_TAG_KEY],
    } as const
  }
}

type RemoveTagFromBankTransactionArg = {
  tagId: string
}

type RemoveTagFromBankTransactionOptions = {
  bankTransactionId: string
}

export function useRemoveTagFromBankTransaction({ bankTransactionId }: RemoveTagFromBankTransactionOptions) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      bankTransactionId,
    }),
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
            transaction_tags: bankTransaction.transaction_tags.filter(
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

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
