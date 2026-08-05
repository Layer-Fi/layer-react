import type { S3PresignedUrl } from '@internal-types/shared/s3'
import { getAsMutation } from '@utils/shared/api/getAsMutation'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
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

export const useGetJournalEntriesDownload = createMutationHook({
  tags: ['#journal-entries', '#exports', '#csv'],
  request: requestJournalEntriesCSV,
  keyParams: ['startDate', 'endDate'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})
