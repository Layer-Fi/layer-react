import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createInfiniteQueryGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

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

type ListTimeEntriesParams = {
  businessId: string
  cursor?: string
  limit?: number
} & ListTimeEntriesFilterParams

const listTimeEntries = getWithQuery<
  typeof ListTimeEntriesResponseSchema.Encoded,
  ListTimeEntriesParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/time-tracking/time-entries`,
)

export const useListTimeEntries = createInfiniteQueryHook({
  tags: [LIST_TIME_ENTRIES_TAG_KEY],
  request: listTimeEntries,
  schema: ListTimeEntriesResponseSchema,
  keyDefaults: { limit: 200 },
})

export const useTimeEntriesGlobalCacheActions = createInfiniteQueryGlobalCacheActions<TimeEntry>(LIST_TIME_ENTRIES_TAG_KEY)
