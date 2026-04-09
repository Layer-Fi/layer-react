import { useCallback } from 'react'
import { formatISO } from 'date-fns'
import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { PaginatedResponseMetaSchema } from '@internal-types/utility/pagination'
import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { SWRInfiniteResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const LIST_TIME_ENTRIES_TAG_KEY = '#list-time-entries'

export type ListTimeEntriesFilterParams = {
  customerId?: string
  serviceId?: string
  startDate?: Date
  endDate?: Date
  includeDeleted?: boolean
  status?: 'ACTIVE' | 'COMPLETED' | 'RECORDED'
  billable?: boolean
  hasCustomer?: boolean
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

const ListTimeEntriesResponseSchema = Schema.Struct({
  data: Schema.Array(TimeEntrySchema),
  meta: Schema.Struct({
    pagination: PaginatedResponseMetaSchema,
  }),
})
type ListTimeEntriesResponse = typeof ListTimeEntriesResponseSchema.Type

function keyLoader(
  previousPageData: ListTimeEntriesResponse | null,
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    customerId,
    serviceId,
    startDate,
    endDate,
    includeDeleted,
    status,
    billable,
    hasCustomer,
    sortBy,
    sortOrder,
  }: {
    access_token?: string
    apiUrl?: string
    businessId: string
    customerId?: string
    serviceId?: string
    startDate?: Date
    endDate?: Date
    includeDeleted?: boolean
    status?: 'ACTIVE' | 'COMPLETED' | 'RECORDED'
    billable?: boolean
    hasCustomer?: boolean
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
  },
) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      cursor: previousPageData?.meta?.pagination.cursor ?? undefined,
      customerId,
      serviceId,
      startDate: startDate ? formatISO(startDate, { representation: 'date' }) : undefined,
      endDate: endDate ? formatISO(endDate, { representation: 'date' }) : undefined,
      includeDeleted,
      status,
      billable,
      hasCustomer,
      sortBy,
      sortOrder,
      tags: [LIST_TIME_ENTRIES_TAG_KEY],
    } as const
  }
}

const listTimeEntries = get<
  typeof ListTimeEntriesResponseSchema.Encoded,
  {
    businessId: string
    cursor?: string
    limit?: number
    customerId?: string
    serviceId?: string
    startDate?: string
    endDate?: string
    includeDeleted?: boolean
    status?: 'ACTIVE' | 'COMPLETED' | 'RECORDED'
    billable?: boolean
    hasCustomer?: boolean
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
  }
>(({ businessId, cursor, limit, customerId, serviceId, startDate, endDate, includeDeleted, status, billable, hasCustomer, sortBy, sortOrder }) => {
  const parameters = toDefinedSearchParameters({
    cursor,
    limit,
    customerId,
    serviceId,
    startDate,
    endDate,
    includeDeleted,
    status,
    billable,
    hasCustomer,
    sortBy,
    sortOrder,
  })
  const baseUrl = `/v1/businesses/${businessId}/time-tracking/time-entries`
  return parameters ? `${baseUrl}?${parameters}` : baseUrl
})

export function useListTimeEntries(filterParams: ListTimeEntriesFilterParams = {}) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListTimeEntriesResponse | null) => keyLoader(
      previousPageData,
      {
        ...data,
        businessId,
        ...filterParams,
      },
    ),
    ({ accessToken, apiUrl, businessId, cursor, customerId, serviceId, startDate, endDate, includeDeleted, status, billable, hasCustomer, sortBy, sortOrder }) => listTimeEntries(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          cursor,
          limit: 200,
          customerId,
          serviceId,
          startDate,
          endDate,
          includeDeleted,
          status,
          billable,
          hasCustomer,
          sortBy,
          sortOrder,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListTimeEntriesResponseSchema)),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  return new SWRInfiniteResult(swrResponse)
}

const withUpdatedTimeEntry = (updated: TimeEntry) =>
  (entry: TimeEntry): TimeEntry => entry.id === updated.id ? updated : entry

export function useTimeEntriesGlobalCacheActions() {
  const { patchCache, forceReload } = useGlobalCacheActions()

  const patchTimeEntryByKey = useCallback((updatedEntry: TimeEntry) =>
    patchCache<ListTimeEntriesResponse[] | ListTimeEntriesResponse | undefined>(
      ({ tags }) => tags.includes(LIST_TIME_ENTRIES_TAG_KEY),
      (currentData) => {
        const iterateOverPage = (page: ListTimeEntriesResponse): ListTimeEntriesResponse => ({
          ...page,
          data: page.data.map(withUpdatedTimeEntry(updatedEntry)),
        })

        return Array.isArray(currentData)
          ? currentData.map(iterateOverPage)
          : currentData
      },
    ),
  [patchCache],
  )

  const forceReloadTimeEntries = useCallback(
    () => forceReload(({ tags }) => tags.includes(LIST_TIME_ENTRIES_TAG_KEY)),
    [forceReload],
  )

  return { patchTimeEntryByKey, forceReloadTimeEntries }
}
