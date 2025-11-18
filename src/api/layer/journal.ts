import { type S3PresignedUrl } from '@internal-types/general'
import { type JournalEntry } from '@internal-types/journal'
import { get, post } from '@api/layer/authenticated_http'

export const createJournalEntries = post<{ data: JournalEntry[] }>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/manual-entries`,
)

export const reverseJournalEntry = post<Record<never, never>>(
  ({ businessId, entryId }) =>
    `/v1/businesses/${businessId}/ledger/entries/${entryId}/reverse`,
)

export const getJournalEntriesCSV = get<{ data: S3PresignedUrl }>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/entries/exports/csv`,
)
