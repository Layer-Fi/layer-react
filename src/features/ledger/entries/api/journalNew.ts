import { S3PresignedUrl } from '../../../../schemas/general'
import { CreateCustomJournalEntry, CustomJournalEntry } from '../../../../schemas/generalLedger/customJournalEntry'
import type { LedgerEntry } from '../../../../schemas/generalLedger/ledgerEntry'
import { get, post } from '../../../../api/layer/authenticated_http'

export const createCustomJournalEntry = post<{ data: CustomJournalEntry }, CreateCustomJournalEntry>(
  ({ businessId }) => `/v1/businesses/${businessId}/custom-journal-entries`,
)

export const reverseJournalEntryNew = post<{ data: LedgerEntry[] }>(
  ({ businessId, entryId }) =>
    `/v1/businesses/${businessId}/ledger/entries/${entryId}/reverse`,
)

export const getJournalEntriesCSVNew = get<{ data: S3PresignedUrl }>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/entries/exports/csv`,
)
