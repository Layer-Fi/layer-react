import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { getWithQuery } from '@utils/api/getWithQuery'
import type { MutationRequest } from '@utils/api/postAsQuery'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

type GetJournalEntriesCSVParams = {
  businessId: string
  startDate?: Date
  endDate?: Date
}

const getJournalEntriesCSV = getWithQuery<
  { data: S3PresignedUrl },
  GetJournalEntriesCSVParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/entries/exports/csv`,
)

const requestJournalEntriesCSV: MutationRequest<
  { data: S3PresignedUrl },
  Record<string, unknown>,
  GetJournalEntriesCSVParams
> = (baseUrl, accessToken, options) =>
  getJournalEntriesCSV(baseUrl, accessToken, { params: options?.params })()

const useJournalEntriesDownloadMutation = createMutationHook({
  tags: ['#journal-entries', '#exports', '#csv'],
  request: requestJournalEntriesCSV,
  keyParams: ['startDate', 'endDate'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})

type UseJournalEntriesDownloadOptions = {
  startDate?: Date
  endDate?: Date
  onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>
}

export function useJournalEntriesDownload({
  startDate,
  endDate,
  onSuccess,
}: UseJournalEntriesDownloadOptions) {
  return useJournalEntriesDownloadMutation({
    startDate,
    endDate,
    swrOptions: { onSuccess },
  })
}
