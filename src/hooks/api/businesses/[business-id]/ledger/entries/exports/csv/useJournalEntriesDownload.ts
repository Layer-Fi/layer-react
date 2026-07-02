import type { S3PresignedUrl } from '@internal-types/general'
import { getWithQuery } from '@utils/api/getWithQuery'
import { getAsMutation } from '@utils/api/postAsQuery'
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

const requestJournalEntriesCSV = getAsMutation(getJournalEntriesCSV)

export const useJournalEntriesDownload = createMutationHook({
  tags: ['#journal-entries', '#exports', '#csv'],
  request: requestJournalEntriesCSV,
  keyParams: ['startDate', 'endDate'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})
