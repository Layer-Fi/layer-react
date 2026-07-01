import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { type APIError } from '@utils/api/apiError'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

type GetJournalEntriesCSVParams = {
  businessId: string
  startDate?: Date
  endDate?: Date
}

const getJournalEntriesCSV = get<{ data: S3PresignedUrl }, GetJournalEntriesCSVParams>(
  ({ businessId, startDate, endDate }) => {
    const parameters = toDefinedSearchParameters({ startDate, endDate })

    return `/v1/businesses/${businessId}/ledger/entries/exports/csv?${parameters}`
  },
)

const buildKey = createBuildKey<{ businessId: string, startDate?: Date, endDate?: Date }>(['#journal-entries', '#exports', '#csv'])

type UseJournalEntriesDownloadOptions = {
  startDate?: Date
  endDate?: Date
  onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>
}

type MutationParams = () => {
  accessToken: string
  apiUrl: string
  businessId: string
  startDate?: Date
  endDate?: Date
} | undefined

export function useJournalEntriesDownload({
  startDate,
  endDate,
  onSuccess,
}: UseJournalEntriesDownloadOptions) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  return useSWRMutation<
    unknown,
    Error | APIError,
    MutationParams
  >(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      startDate,
      endDate,
    })),
    ({ accessToken, apiUrl, businessId, startDate, endDate }) => getJournalEntriesCSV(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          startDate,
          endDate,
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
