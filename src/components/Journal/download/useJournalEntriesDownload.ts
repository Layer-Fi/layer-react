import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { type APIError } from '@models/APIError'
import { getJournalEntriesCSV } from '@api/layer/journal'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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
      tags: ['#journal-entries', '#exports', '#csv'],
    }
  }
}

type UseJournalEntriesDownloadOptions = {
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

export function useJournalEntriesDownload({
  startCutoff,
  endCutoff,
  onSuccess,
}: UseJournalEntriesDownloadOptions) {
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
    ({ accessToken, apiUrl, businessId, startCutoff, endCutoff }) => getJournalEntriesCSV(
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
