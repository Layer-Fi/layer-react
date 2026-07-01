import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
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

const ListTimeEntriesResponseSchema = PaginatedResponseSchema(TimeEntrySchema)
type ListTimeEntriesResponse = typeof ListTimeEntriesResponseSchema.Type

const keyLoader = createInfiniteKeyLoader<
  { businessId: string } & ListTimeEntriesFilterParams,
  ListTimeEntriesResponse
>([LIST_TIME_ENTRIES_TAG_KEY])

const listTimeEntries = get<
  typeof ListTimeEntriesResponseSchema.Encoded,
  {
    businessId: string
    cursor?: string | null
    limit?: number
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
  const query = parameters.toString()
  return query ? `${baseUrl}?${query}` : baseUrl
})

export function useListTimeEntries(filterParams: ListTimeEntriesFilterParams = {}) {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListTimeEntriesResponse | null) => withLocale(keyLoader(
      previousPageData,
      {
        ...data,
        businessId,
        ...filterParams,
      },
    )),
    ({
      accessToken, apiUrl, businessId, cursor, customerId, serviceId,
      startDate, endDate, includeDeleted, status, billable, hasCustomer, sortBy, sortOrder,
    }) => listTimeEntries(
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

  usePreserveInfiniteSize(swrResponse)

  return useSWRInfiniteResult(swrResponse)
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
