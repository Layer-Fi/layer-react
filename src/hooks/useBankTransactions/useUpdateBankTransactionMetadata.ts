import useSWRMutation from 'swr/mutation'
import { Layer } from '../../api/layer'
import type { Awaitable } from '../../types/utility/promises'
import { useAuth } from '../../hooks/useAuth'
import { useLayerContext } from '../../contexts/LayerContext'
import { withSWRKeyTags } from '../../utils/swr/withSWRKeyTags'
import { useSWRConfig } from 'swr'
import { GET_BANK_TRANSACTION_METADATA_TAG_KEY } from './useBankTransactionsMetadata'

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

  return Object.assign(
    mutationResponse,
    {
      trigger: async (...triggerParameters: Parameters<typeof originalTrigger>) => {
        const data = await originalTrigger(...triggerParameters)
        if (data) {
          await mutate(key => withSWRKeyTags(key, tags => tags.includes(GET_BANK_TRANSACTION_METADATA_TAG_KEY)))
        }

        return data
      },
    })
}
