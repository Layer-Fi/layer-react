import useSWR, { type SWRResponse } from 'swr'
import { Schema } from 'effect/index'

import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { TransactionUploadsResponseSchema, type TransactionUpload } from '@schemas/bankTransactions/transactionUpload'

type TransactionUploadsData = {
  type: 'Custom_Transaction_Uploads'
  uploads: TransactionUpload[]
}

class uploadsSWRResponse {
    private swrResponse: SWRResponse<TransactionUploadsData>

    constructor(swrResponse: SWRResponse<TransactionUploadsData>) {
      this.swrResponse = swrResponse
    }

    get data() {
      return this.swrResponse.data
    }

    get isLoading() {
      return this.swrResponse.isLoading
    }

    get isValidating() {
      return this.swrResponse.isValidating
    }

    get isError() {
      return this.swrResponse.error !== undefined
    }

    get refetch() {
      return this.swrResponse.mutate
    }
  }
  
function buildKey({
    access_token: accessToken,
    apiUrl,
    businessId,
  }: {
    access_token?: string
    apiUrl?: string
    businessId: string
  }) {
    if (accessToken && apiUrl) {
      return {
        accessToken,
        apiUrl,
        businessId,
      } as const
    }
  }

const getUploads = get<
  typeof TransactionUploadsResponseSchema.Encoded,
  {
    businessId: string
  }
>(({ businessId }) => {
  const baseUrl = `/v1/businesses/${businessId}/transaction-uploads`
  return baseUrl
})

export function useManageUploads() {
    const { data } = useAuth()
    const { businessId } = useLayerContext()

    const response = useSWR(
      () => buildKey({
        ...data,
        businessId,
      }),
      ({ accessToken, apiUrl, businessId }) => getUploads(
        apiUrl,
        accessToken,
        {
          params: { businessId },
        },
      )()
        .then(({ data }) => data),
    )

    return new uploadsSWRResponse(response)
  }