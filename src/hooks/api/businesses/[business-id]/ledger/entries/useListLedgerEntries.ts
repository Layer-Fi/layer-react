import { type SortOrder } from '@internal-types/utility/pagination'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type LedgerEntry, LedgerEntrySchema } from '@schemas/generalLedger/ledgerEntry'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createInfiniteQueryGlobalCacheActions } from '@hooks/utils/swr/createInfiniteQueryGlobalCacheActions'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

export const LIST_LEDGER_ENTRIES_TAG_KEY = '#list-ledger-entries'

export enum LedgerEntriesSortBy {
  EntryAt = 'entry_at',
  EntryNumber = 'entry_number',
  CreatedAt = 'created_at',
}

type GetLedgerEntriesParams = {
  businessId: string
  sortBy?: LedgerEntriesSortBy
  sortOrder?: SortOrder
  cursor?: string
  limit?: number
  showTotalCount?: boolean
}

const ListLedgerEntriesResponseSchema = PaginatedResponseSchema(LedgerEntrySchema)

export type ListLedgerEntriesReturn = typeof ListLedgerEntriesResponseSchema.Type

export const listLedgerEntries = getWithQuery<
  typeof ListLedgerEntriesResponseSchema.Encoded,
  GetLedgerEntriesParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/entries`,
)

export const useListLedgerEntries = createInfiniteQueryHook({
  tags: [LIST_LEDGER_ENTRIES_TAG_KEY],
  request: listLedgerEntries,
  schema: ListLedgerEntriesResponseSchema,
})

export const useLedgerEntriesCacheActions = createInfiniteQueryGlobalCacheActions<LedgerEntry>(LIST_LEDGER_ENTRIES_TAG_KEY)
