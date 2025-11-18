import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import type { Awaitable } from '@internal-types/utility/promises'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { Layer } from '@api/layer'
import { useAuth } from '@hooks/useAuth'
import { GET_BANK_TRANSACTION_METADATA_TAG_KEY } from '@hooks/useBankTransactions/useBankTransactionsMetadata'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export type UpdateBankTransactionMetadataBody = { memo: string }

const UPDATE_BANK_TRANSACTION_METADATA_TAG_KEY = '#update-bank-transaction-metadata'

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
      tags: [UPDATE_BANK_TRANSACTION_METADATA_TAG_KEY],
    }
  }
}

export function useUpdateBankTransactionMetadata({ bankTransactionId, onSuccess }: { bankTransactionId: string, onSuccess?: () => Awaitable<unknown> }) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
      bankTransactionId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: UpdateBankTransactionMetadataBody },
    ) => Layer.updateBankTransactionMetadata(apiUrl, accessToken,
      {
        params: {
          businessId,
          bankTransactionId,
        },
        body,
      },
    ).then(({ data }) => {
      onSuccess?.()
      return data
    }),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        tags => tags.includes(GET_BANK_TRANSACTION_METADATA_TAG_KEY),
      ))

      return triggerResult
    },
    [
      originalTrigger,
      mutate,
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
