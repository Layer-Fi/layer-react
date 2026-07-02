import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { LedgerAccountLineItemSchema } from '@schemas/generalLedger/ledgerEntry'
import { getWithQuery } from '@utils/api/getWithQuery'
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

export type UseListLedgerAccountLinesOptions = {
  accountId: string
  include_entries_before_activation?: boolean
  include_child_account_lines?: boolean
  start_date?: string
  end_date?: string
  sort_by?: 'entry_at' | 'entry_number' | 'created_at'
  sort_order?: 'ASC' | 'ASCENDING' | 'DESC' | 'DESCENDING' | 'DES'
  limit?: number
  show_total_count?: boolean
}

const useListLedgerAccountLinesQuery = createInfiniteQueryHook({
  tags: [LIST_LEDGER_ACCOUNT_LINES_TAG_KEY],
  request: listLedgerAccountLines,
  schema: ListLedgerAccountLinesResponseSchema,
})

export function useListLedgerAccountLines(options: UseListLedgerAccountLinesOptions) {
  return useListLedgerAccountLinesQuery({
    ...options,
    isEnabled: Boolean(options.accountId),
  })
}
