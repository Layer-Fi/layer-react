import { SortOrder } from '@internal-types/utility/pagination'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type LedgerAccountLineItem, LedgerAccountLineItemSchema } from '@schemas/features/generalLedger/ledgerEntry'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createInfiniteQueryGlobalCacheActions } from '@hooks/utils/swr/createInfiniteQueryGlobalCacheActions'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

export const LIST_LEDGER_ACCOUNT_LINES_TAG_KEY = '#list-ledger-account-lines'

enum SortBy {
  EntryAt = 'entry_at',
  EntryNumber = 'entry_number',
  CreatedAt = 'created_at',
}

type GetLedgerAccountLinesParams = {
  businessId: string
  accountId: string
  include_entries_before_activation?: boolean
  include_child_account_lines?: boolean
  start_date?: string
  end_date?: string
  sort_by?: SortBy
  sort_order?: SortOrder
  cursor?: string
  limit?: number
  show_total_count?: boolean
}

const ListLedgerAccountLinesResponseSchema = PaginatedResponseSchema(LedgerAccountLineItemSchema)

export type ListLedgerAccountLinesReturn = typeof ListLedgerAccountLinesResponseSchema.Type

export const listLedgerAccountLines = getWithQuery<
  typeof ListLedgerAccountLinesResponseSchema.Encoded,
  GetLedgerAccountLinesParams
>(
  ['businessId', 'accountId'],
  ({ businessId, accountId }) => `/v1/businesses/${businessId}/ledger/accounts/${accountId}/lines`,
)

export const useGetListLedgerAccountLines = createInfiniteQueryHook({
  tags: [LIST_LEDGER_ACCOUNT_LINES_TAG_KEY],
  request: listLedgerAccountLines,
  schema: ListLedgerAccountLinesResponseSchema,
  keyDefaults: {
    include_child_account_lines: true,
    sort_by: SortBy.EntryAt,
    sort_order: SortOrder.DESC,
    limit: 150,
  },
})

export const useLedgerAccountLinesCacheActions = createInfiniteQueryGlobalCacheActions<LedgerAccountLineItem>(LIST_LEDGER_ACCOUNT_LINES_TAG_KEY)
