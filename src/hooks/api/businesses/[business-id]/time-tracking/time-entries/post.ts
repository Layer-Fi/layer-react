import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { TimeEntrySchema } from '@schemas/features/timeTracking/timeEntry'
import { type UpsertTimeEntryEncoded } from '@schemas/features/timeTracking/upsertTimeEntry'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useTimeEntriesGlobalCacheActions } from '@api/businesses/[business-id]/time-tracking/time-entries/get'
import { useTimeTrackingSummaryGlobalCacheActions } from '@api/businesses/[business-id]/time-tracking/time-entries/summary/get'

export const UPSERT_TIME_ENTRY_TAG_KEY = '#upsert-time-entry'

export type CreateTimeEntryBody = UpsertTimeEntryEncoded

export const UpsertTimeEntryReturnSchema = UnwrappedDataResponseSchema(TimeEntrySchema)

export type UpsertTimeEntryReturn = typeof UpsertTimeEntryReturnSchema.Type
export type UpsertTimeEntryReturnEncoded = typeof UpsertTimeEntryReturnSchema.Encoded

const createTimeEntry = post<UpsertTimeEntryReturnEncoded, CreateTimeEntryBody>(
  ({ businessId }) => `/v1/businesses/${businessId}/time-tracking/time-entries`,
)

export const usePostTimeEntry = createMutationHook({
  tags: [UPSERT_TIME_ENTRY_TAG_KEY],
  request: createTimeEntry,
  schema: UpsertTimeEntryReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadTimeEntries } = useTimeEntriesGlobalCacheActions()
    const { invalidate: invalidateTimeTrackingSummary } = useTimeTrackingSummaryGlobalCacheActions()

    return () => {
      void forceReloadTimeEntries()
      void invalidateTimeTrackingSummary()
    }
  },
})
