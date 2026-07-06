import { type PaginationParams, SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type Invoice, InvoiceSchema, type InvoiceStatus } from '@schemas/invoices/invoice'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

export const LIST_INVOICES_TAG_KEY = '#list-invoices'

export type ListInvoicesFilterParams = {
  showSalesReceipts?: boolean
  status?: ReadonlyArray<InvoiceStatus>
  query?: string
  dueAtStart?: Date
  dueAtEnd?: Date
}

enum SortBy {
  SentAt = 'sent_at',
}

type ListInvoicesParams = {
  businessId: string
  cursor?: string
} & ListInvoicesFilterParams & Omit<PaginationParams, 'cursor'> & SortParams<SortBy>

const ListInvoicesReturnSchema = PaginatedResponseSchema(InvoiceSchema)

export const listInvoices = getWithQuery<
  typeof ListInvoicesReturnSchema.Encoded,
  ListInvoicesParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/invoices`,
  ({ showSalesReceipts, status, query, dueAtStart, dueAtEnd, sortBy, sortOrder, cursor, limit, showTotalCount }) => ({
    showSalesReceipts,
    status,
    q: query,
    dueAtStart,
    dueAtEnd,
    sortBy,
    sortOrder,
    cursor,
    limit,
    showTotalCount,
  }),
)

export const useListInvoices = createInfiniteQueryHook({
  tags: [LIST_INVOICES_TAG_KEY],
  request: listInvoices,
  schema: ListInvoicesReturnSchema,
  keyDefaults: {
    sortBy: SortBy.SentAt,
    sortOrder: SortOrder.DESC,
    showTotalCount: true,
  },
})

export const useInvoicesGlobalCacheActions = createInfiniteQueryGlobalCacheActions<Invoice>(LIST_INVOICES_TAG_KEY)
