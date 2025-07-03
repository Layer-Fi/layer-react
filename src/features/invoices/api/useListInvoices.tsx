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
>(({ businessId, status, sortBy, sortOrder, cursor, limit, showTotalCount }) => {
  const parameters = toDefinedSearchParameters({
    status,
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
  sortBy,
  sortOrder,
  limit,
  showTotalCount,
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
      revalidateAll: true,
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
      optimisticUpdate<
        Array<ListInvoicesReturn> | ListInvoicesReturn
      >(
        tags => tags.includes(LIST_INVOICES_TAG_KEY),
        (currentData) => {
          const iterateOverPage = (page: ListInvoicesReturn): ListInvoicesReturn => ({
            ...page,
            data: page.data.map(invoice => transformInvoice(invoice)),
          })

          if (Array.isArray(currentData)) {
            return currentData.map(iterateOverPage)
          }

          return currentData
        },
      ),
    [optimisticUpdate],
  )

  return { optimisticallyUpdateInvoices }
}
