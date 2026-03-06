import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { PaginatedResponseMetaSchema, type PaginationParams, SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { SWRInfiniteResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { type Invoice, InvoiceSchema, type InvoiceStatus } from '@features/invoices/invoiceSchemas'

export const LIST_INVOICES_TAG_KEY = '#list-invoices'

type ListInvoicesBaseParams = {
  businessId: string
}

export type ListInvoicesFilterParams = {
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

const ListInvoicesReturnSchema = Schema.Struct({
  data: Schema.Array(InvoiceSchema),
  meta: Schema.Struct({
    pagination: PaginatedResponseMetaSchema,
  }),
})

type ListInvoicesReturn = typeof ListInvoicesReturnSchema.Type

export const listInvoices = get<
  ListInvoicesReturn,
  ListInvoicesParams
>(({ businessId, status, query, dueAtStart, dueAtEnd, sortBy, sortOrder, cursor, limit, showTotalCount }) => {
  const parameters = toDefinedSearchParameters({
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

function keyLoader(
  previousPageData: ListInvoicesReturn | null,
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    status,
    query,
    dueAtStart,
    dueAtEnd,
    sortBy,
    sortOrder,
    limit,
    showTotalCount,
  }: {
    access_token?: string
    apiUrl?: string
  } & Omit<ListInvoicesParams, 'cursor'>,
) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      status,
      query,
      dueAtStart,
      dueAtEnd,
      cursor: previousPageData?.meta?.pagination.cursor,
      sortBy,
      sortOrder,
      limit,
      showTotalCount,
      tags: [LIST_INVOICES_TAG_KEY],
    } as const
  }
}

export function useListInvoices({
  status,
  query,
  dueAtStart,
  dueAtEnd,
  sortBy = SortBy.SentAt,
  sortOrder = SortOrder.DESC,
  limit,
  showTotalCount = true,
}: ListInvoicesOptions = {}) {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListInvoicesReturn | null) => keyLoader(
      previousPageData,
      {
        ...auth,
        apiUrl,
        businessId,
        status,
        query,
        dueAtStart,
        dueAtEnd,
        sortBy,
        sortOrder,
        limit,
        showTotalCount,
      },
    ),
    ({
      accessToken,
      apiUrl,
      businessId,
      cursor,
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

  return new SWRInfiniteResult(swrResponse)
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
