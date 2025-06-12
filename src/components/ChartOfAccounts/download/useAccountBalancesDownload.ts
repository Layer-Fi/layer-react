import useSWRMutation from 'swr/mutation'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useAuth } from '../../../hooks/useAuth'
import type { S3PresignedUrl } from '../../../types/general'
import type { Awaitable } from '../../../types/utility/promises'
import { getLedgerAccountBalancesCSV } from '../../../api/layer/chart_of_accounts'
import { APIError } from '../../../models/APIError'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  startCutoff,
  endCutoff,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  startCutoff?: Date
  endCutoff?: Date
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      startCutoff,
      endCutoff,
      tags: ['#account-balances', '#exports', '#csv'],
    }
  }
}

type UseAccountBalancesDownloadOptions = {
  startCutoff?: Date
  endCutoff?: Date
  onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>
}

type MutationParams = () => {
  accessToken: string
  apiUrl: string
  businessId: string
  startCutoff: Date | undefined
  endCutoff: Date | undefined
} | undefined

export function useAccountBalancesDownload({
  startCutoff,
  endCutoff,
  onSuccess,
}: UseAccountBalancesDownloadOptions) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWRMutation<
    unknown,
    Error | APIError,
    MutationParams
  >(
    () => buildKey({
      ...auth,
      businessId,
      startCutoff,
      endCutoff,
    }),
    ({ accessToken, apiUrl, businessId, startCutoff, endCutoff }) => getLedgerAccountBalancesCSV(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          startCutoff: startCutoff?.toISOString(),
          endCutoff: endCutoff?.toISOString(),
        },
      })().then(({ data }) => {
      if (onSuccess) {
        return onSuccess(data)
      }
    }),
    {
      revalidate: false,
      throwOnError: false,
    },
  )
}
