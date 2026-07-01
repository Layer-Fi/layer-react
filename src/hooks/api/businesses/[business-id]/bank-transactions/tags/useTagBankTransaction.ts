import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'
import { v4 as uuidv4 } from 'uuid'

import type { TransactionTagEncoded } from '@schemas/tag'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import {
  useBankTransactionsGlobalCacheActions,
} from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const TAG_BANK_TRANSACTION_TAG_KEY = '#tag-bank-transaction'

type TagBankTransactionBody = {
  key_values: ReadonlyArray<{
    key: string
    dimension_display_name?: string | null
    value: string
    value_display_name?: string | null
  }>
  transaction_ids: ReadonlyArray<string>
}

type TagBankTransactionResponse = {
  data: {
    type: string
    tags: ReadonlyArray<TransactionTagEncoded>
  }
}

const tagBankTransaction = post<
  TagBankTransactionResponse,
  TagBankTransactionBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/bank-transactions/tags`)

const buildKey = createBuildKey<{ businessId: string, bankTransactionId: string }>([TAG_BANK_TRANSACTION_TAG_KEY])

type TagBankTransactionArg = {
  key: string
  dimensionDisplayName?: string | null
  value: string
  valueDisplayName?: string | null
}

type TagBankTransactionOptions = {
  bankTransactionId: string
}

export function useTagBankTransaction({ bankTransactionId }: TagBankTransactionOptions) {
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
      { accessToken, apiUrl, businessId, bankTransactionId },
      { arg: { key, value, dimensionDisplayName, valueDisplayName } }: { arg: TagBankTransactionArg },
    ) => tagBankTransaction(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body: {
          key_values: [{ key, dimension_display_name: dimensionDisplayName, value, value_display_name: valueDisplayName }],
          transaction_ids: [bankTransactionId],
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
      const { key, value, dimensionDisplayName, valueDisplayName } = triggerParameters[0]
      const optimisticTagId = uuidv4()

      // Add optimistic tag immediately
      void optimisticallyUpdateBankTransactions((bankTransaction) => {
        if (bankTransaction.id === bankTransactionId) {
          const now = new Date()

          return {
            ...bankTransaction,
            transactionTags: [
              ...bankTransaction.transactionTags,
              {
                id: optimisticTagId,
                key,
                value,
                createdAt: now,
                updatedAt: now,
                dimensionDisplayName,
                valueDisplayName,
                archivedAt: null,
                deletedAt: null,

                _local: {
                  isOptimistic: true,
                },
              },
            ],
          }
        }

        return bankTransaction
      })

      // Wait for the API response and replace optimistic tag with real one
      const response = await originalTrigger(...triggerParameters)

      void debouncedInvalidateBankTransactions({
        withPrecedingOptimisticUpdate: true,
      })

      return response
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
