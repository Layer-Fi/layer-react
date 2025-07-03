import useSWRInfinite, { type SWRInfiniteResponse } from 'swr/infinite'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useAuth } from '../../../hooks/useAuth'
import { useEnvironment } from '../../../providers/Environment/EnvironmentInputProvider'
import { get } from '../../../api/layer/authenticated_http'
import { useGlobalInvalidator, useGlobalOptimisticUpdater } from '../../../utils/swr/useGlobalInvalidator'
import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash'
import { Schema } from 'effect'
import { toDefinedSearchParameters } from '../../../utils/request/toDefinedSearchParameters'
import { PaginatedResponseMetaSchema, type PaginationParams, type SortParams } from '../../../types/utility/pagination'
import { InvoiceStatus, InvoiceSchema, type Invoice } from '../invoiceSchemas'

export const LIST_INVOICES_TAG_KEY = '#list-invoices'

type ListInvoicesBaseParams = {
  businessId: string
}

type ListInvoicesFilterParams = {
  status?: ReadonlyArray<InvoiceStatus>
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

class ListInvoicesSWRResponse {
  private swrResponse: SWRInfiniteResponse<ListInvoicesReturn>

  constructor(swrResponse: SWRInfiniteResponse<ListInvoicesReturn>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

export const listInvoices = get<
  ListInvoicesReturn,
  ListInvoicesParams
>(({ businessId, status, sort_by, sort_order, cursor, limit, show_total_count }) => {
  const parameters = toDefinedSearchParameters({
    status,
    sort_by,
    sort_order,
    cursor,
    limit,
    show_total_count,
  })

  return `/v1/businesses/${businessId}/invoices?${parameters}`
})

function keyLoader(
  previousPageData: ListInvoicesReturn | null,
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    status,
    sort_by,
    sort_order,
    limit,
    show_total_count,
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
      cursor: previousPageData?.meta?.pagination.cursor,
      sort_by,
      sort_order,
      limit,
      show_total_count,
      tags: [LIST_INVOICES_TAG_KEY],
    } as const
  }
}

export function useListInvoices({
  status,
  sort_by,
  sort_order,
  limit,
  show_total_count,
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
        sort_by,
        sort_order,
        limit,
        show_total_count,
      },
    ),
    ({
      accessToken,
      apiUrl,
      businessId,
      cursor,
      status,
      sort_by,
      sort_order,
      limit,
      show_total_count,
    }) => listInvoices(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          status,
          sort_by,
          sort_order,
          cursor,
          limit,
          show_total_count,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListInvoicesReturnSchema)),
    {
      keepPreviousData: true,
      revalidateAll: false,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  return new ListInvoicesSWRResponse(swrResponse)
}

const INVALIDATION_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

export function useInvoicesInvalidator() {
  const { invalidate } = useGlobalInvalidator()

  const invalidateInvoices = useCallback(
    () => invalidate(tags => tags.includes(LIST_INVOICES_TAG_KEY)),
    [invalidate],
  )

  const debouncedInvalidateInvoices = useMemo(
    () => debounce(
      invalidateInvoices,
      INVALIDATION_DEBOUNCE_OPTIONS.wait,
      {
        maxWait: INVALIDATION_DEBOUNCE_OPTIONS.maxWait,
        trailing: true,
      },
    ),
    [invalidateInvoices],
  )

  return {
    invalidateInvoices,
    debouncedInvalidateInvoices,
  }
}

export function useInvoicesOptimisticUpdater() {
  const { optimisticUpdate } = useGlobalOptimisticUpdater()

  const optimisticallyUpdateInvoices = useCallback(
    (
      transformInvoice: (invoice: Invoice) => Invoice,
    ) =>
      optimisticUpdate<ListInvoicesReturn>(
        tags => tags.includes(LIST_INVOICES_TAG_KEY),
        (currentData) => {
          return {
            ...currentData,
            data: currentData.data.map(invoice => transformInvoice(invoice)),
          }
        },
      ),
    [optimisticUpdate],
  )

  return { optimisticallyUpdateInvoices }
}
