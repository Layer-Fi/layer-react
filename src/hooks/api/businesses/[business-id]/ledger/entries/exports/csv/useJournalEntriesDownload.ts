import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { type APIError } from '@utils/api/apiError'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const getJournalEntriesCSV = get<{ data: S3PresignedUrl }>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/entries/exports/csv`,
)

const buildKey = createBuildKey<{ businessId: string, startCutoff?: Date, endCutoff?: Date }>(['#journal-entries', '#exports', '#csv'])

type UseJournalEntriesDownloadOptions = {
  startCutoff?: Date
  endCutoff?: Date
  onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>
}

type MutationParams = () => {
  accessToken: string
  apiUrl: string
  businessId: string
  startCutoff?: Date
  endCutoff?: Date
} | undefined

export function useJournalEntriesDownload({
  startCutoff,
  endCutoff,
  onSuccess,
}: UseJournalEntriesDownloadOptions) {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWRMutation<
    unknown,
    Error | APIError,
    MutationParams
  >(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      startCutoff,
      endCutoff,
    })),
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
