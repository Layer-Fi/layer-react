import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { type PaginationParams, SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type Invoice, InvoiceSchema, type InvoiceStatus } from '@schemas/invoices/invoice'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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
  const withLocale = useLocalizedKey()
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

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

const withUpdatedInvoice = (updated: Invoice) =>
  (inv: Invoice): Invoice => inv.id === updated.id ? updated : inv

export function useInvoicesGlobalCacheActions() {
  const { invalidate, patchCache, forceReload } = useGlobalCacheActions()

  const invalidateInvoices = useCallback(
    () => invalidate(({ tags }) => tags.includes(LIST_INVOICES_TAG_KEY)),
    [invalidate],
  )

  const patchInvoiceByKey = useCallback((updatedInvoice: Invoice) =>
    patchCache<ListInvoicesReturn[] | ListInvoicesReturn | undefined>(
      ({ tags }) => tags.includes(LIST_INVOICES_TAG_KEY),
      (currentData) => {
        const iterateOverPage = (page: ListInvoicesReturn): ListInvoicesReturn => ({
          ...page,
          data: page.data.map(withUpdatedInvoice(updatedInvoice)),
        })

        return Array.isArray(currentData)
          ? currentData.map(iterateOverPage)
          : currentData
      },
    ),
  [patchCache],
  )

  const patchInvoiceWithTransformation = useCallback((transformation: (invoice: Invoice) => Invoice) =>
    patchCache<ListInvoicesReturn[] | ListInvoicesReturn | undefined>(
      ({ tags }) => tags.includes(LIST_INVOICES_TAG_KEY),
      (currentData) => {
        const iterateOverPage = (page: ListInvoicesReturn): ListInvoicesReturn => ({
          ...page,
          data: page.data.map(transformation),
        })

        return Array.isArray(currentData)
          ? currentData.map(iterateOverPage)
          : currentData
      },
    ),
  [patchCache],
  )

  const forceReloadInvoices = useCallback(
    () => forceReload(({ tags }) => tags.includes(LIST_INVOICES_TAG_KEY)),
    [forceReload],
  )

  return { invalidateInvoices, patchInvoiceByKey, patchInvoiceWithTransformation, forceReloadInvoices }
}
