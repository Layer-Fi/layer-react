import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type LedgerAccountLineItem, LedgerAccountLineItemSchema } from '@schemas/features/generalLedger/ledgerEntry'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createInfiniteQueryGlobalCacheActions } from '@hooks/utils/swr/createInfiniteQueryGlobalCacheActions'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

export const LIST_LEDGER_ACCOUNT_LINES_TAG_KEY = '#list-ledger-account-lines'

type GetLedgerAccountLinesParams = {
  businessId: string
  accountId: string
  include_entries_before_activation?: boolean
  include_child_account_lines?: boolean
  start_date?: string
  end_date?: string
  sort_by?: 'entry_at' | 'entry_number' | 'created_at'
  sort_order?: 'ASC' | 'ASCENDING' | 'DESC' | 'DESCENDING' | 'DES'
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
    sort_by: 'entry_at',
    sort_order: 'DESC',
    limit: 150,
  },
})

export const useLedgerAccountLinesCacheActions = createInfiniteQueryGlobalCacheActions<LedgerAccountLineItem>(LIST_LEDGER_ACCOUNT_LINES_TAG_KEY)
