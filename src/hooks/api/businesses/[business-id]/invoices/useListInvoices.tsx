import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { type PaginationParams, SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type Invoice, InvoiceSchema, type InvoiceStatus } from '@schemas/invoices/invoice'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const LIST_INVOICES_TAG_KEY = '#list-invoices'

type ListInvoicesBaseParams = {
  businessId: string
}

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

type ListInvoicesOptions = ListInvoicesFilterParams & PaginationParams & SortParams<SortBy>

type ListInvoicesParams = ListInvoicesBaseParams & ListInvoicesOptions

const ListInvoicesReturnSchema = PaginatedResponseSchema(InvoiceSchema)

type ListInvoicesReturn = typeof ListInvoicesReturnSchema.Type

export const listInvoices = get<
  ListInvoicesReturn,
  ListInvoicesParams
>(({ businessId, showSalesReceipts, status, query, dueAtStart, dueAtEnd, sortBy, sortOrder, cursor, limit, showTotalCount }) => {
  const parameters = toDefinedSearchParameters({
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
  })

  const baseUrl = `/v1/businesses/${businessId}/invoices`
  return parameters ? `${baseUrl}?${parameters}` : baseUrl
})

const keyLoader = createInfiniteKeyLoader<
  Omit<ListInvoicesParams, 'cursor'>,
  ListInvoicesReturn
>([LIST_INVOICES_TAG_KEY])

export function useListInvoices({
  status,
  showSalesReceipts,
  query,
  dueAtStart,
  dueAtEnd,
  sortBy = SortBy.SentAt,
  sortOrder = SortOrder.DESC,
  limit,
  showTotalCount = true,
}: ListInvoicesOptions = {}) {
  const { withLocale, businessId, apiUrl, auth } = useBuildKeyInputs()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListInvoicesReturn | null) => withLocale(keyLoader(
      previousPageData,
      {
        ...auth,
        apiUrl,
        businessId,
        showSalesReceipts,
        status,
        query,
        dueAtStart,
        dueAtEnd,
        sortBy,
        sortOrder,
        limit,
        showTotalCount,
      },
    )),
    ({
      accessToken,
      apiUrl,
      businessId,
      cursor,
      showSalesReceipts,
      status,
      query,
      dueAtStart,
      dueAtEnd,
      sortBy,
      sortOrder,
      limit,
      showTotalCount,
    }) => listInvoices(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          showSalesReceipts,
          status,
          query,
          dueAtStart,
          dueAtEnd,
          sortBy,
          sortOrder,
          cursor,
          limit,
          showTotalCount,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListInvoicesReturnSchema)),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  usePreserveInfiniteSize(swrResponse)

  return useSWRInfiniteResult(swrResponse)
}

export const useInvoicesGlobalCacheActions = createInfiniteQueryGlobalCacheActions<Invoice>(LIST_INVOICES_TAG_KEY)
