import useSWRMutation from 'swr/mutation'
import { useAuth } from '../../../../../hooks/useAuth'
import { useLayerContext } from '../../../../../contexts/LayerContext'
import { useCallback } from 'react'
import { post } from '../../../../../api/layer/authenticated_http'
import {
  useBankTransactionsInvalidator,
  useBankTransactionsOptimisticUpdater,
} from '../../../../../hooks/useBankTransactions/useBankTransactions'
import { v4 as uuidv4 } from 'uuid'

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

const tagBankTransaction = post<
  Record<string, never>,
  TagBankTransactionBody,
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
      tags: [TAG_BANK_TRANSACTION_TAG_KEY],
    } as const
  }
}

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
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      bankTransactionId,
    }),
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

  const { optimisticallyUpdateBankTransactions } = useBankTransactionsOptimisticUpdater()
  const { debouncedInvalidateBankTransactions } = useBankTransactionsInvalidator()

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResultPromise = originalTrigger(...triggerParameters)

      void optimisticallyUpdateBankTransactions((bankTransaction) => {
        if (bankTransaction.id === bankTransactionId) {
          const { key, value, dimensionDisplayName, valueDisplayName } = triggerParameters[0]

          const optimisticTagId = uuidv4()

          const now = new Date()
          const nowISOString = now.toISOString()

          return {
            ...bankTransaction,
            transaction_tags: [
              ...bankTransaction.transaction_tags,
              {
                id: optimisticTagId,
                key,
                value,
                created_at: nowISOString,
                updated_at: nowISOString,
                dimension_display_name: dimensionDisplayName,
                value_display_name: valueDisplayName,
                archived_at: null,
                deleted_at: null,

                _local: {
                  isOptimistic: true,
                },
              },
            ],
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
