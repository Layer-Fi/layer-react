import type { S3PresignedUrl } from '@internal-types/general'
import type { Awaitable } from '@internal-types/utility/promises'
import { get } from '@utils/api/authenticatedHttp'
import type { MutationRequest } from '@utils/api/postAsQuery'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

type GetJournalEntriesCSVParams = {
  businessId: string
  startCutoff?: Date
  endCutoff?: Date
}

const getJournalEntriesCSV = get<
  { data: S3PresignedUrl },
  GetJournalEntriesCSVParams
>(({ businessId }) => `/v1/businesses/${businessId}/ledger/entries/exports/csv`)

const requestJournalEntriesCSV: MutationRequest<
  { data: S3PresignedUrl },
  Record<string, unknown>,
  GetJournalEntriesCSVParams
> = (baseUrl, accessToken, options) =>
  getJournalEntriesCSV(baseUrl, accessToken, { params: options?.params })()

const useJournalEntriesDownloadMutation = createMutationHook({
  tags: ['#journal-entries', '#exports', '#csv'],
  request: requestJournalEntriesCSV,
  keyParams: ['startCutoff', 'endCutoff'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})

type UseJournalEntriesDownloadOptions = {
  startCutoff?: Date
  endCutoff?: Date
  onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>
}

export function useJournalEntriesDownload({
  startCutoff,
  endCutoff,
  onSuccess,
}: UseJournalEntriesDownloadOptions) {
  return useJournalEntriesDownloadMutation({
    startCutoff,
    endCutoff,
    swrOptions: { onSuccess },
  })
}
