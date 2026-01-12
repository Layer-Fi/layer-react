import { useCallback } from 'react'
import type { Key } from 'swr'
import { useSWRConfig } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import type { BankTransactionMetadata } from '@internal-types/bank_transactions'
import type { Awaitable } from '@internal-types/utility/promises'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { Layer } from '@api/layer'
import { useAuth } from '@hooks/useAuth'
import { GET_BANK_TRANSACTION_METADATA_TAG_KEY } from '@hooks/useBankTransactions/useBankTransactionsMetadata'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export type UpdateBankTransactionMetadataBody = { memo: string }

const UPDATE_BANK_TRANSACTION_METADATA_TAG_KEY = '#update-bank-transaction-metadata'

type UpdateBankTransactionMetadataSWRMutationResponse =
    SWRMutationResponse<BankTransactionMetadata, unknown, Key, UpdateBankTransactionMetadataBody>

class UpdateBankTransactionMetadataSWRResponse {
  private swrResponse: UpdateBankTransactionMetadataSWRMutationResponse

  constructor(swrResponse: UpdateBankTransactionMetadataSWRMutationResponse) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get trigger() {
    return this.swrResponse.trigger
  }

  get isMutating() {
    return this.swrResponse.isMutating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

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

  const rawMutationResponse = useSWRMutation(
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

  const mutationResponse = new UpdateBankTransactionMetadataSWRResponse(rawMutationResponse)
  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        ({ tags }) => tags.includes(GET_BANK_TRANSACTION_METADATA_TAG_KEY),
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
