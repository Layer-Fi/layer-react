import { patch } from '@utils/shared/api/authenticatedHttp'
import { useTimeEntriesGlobalCacheActions } from '@api/businesses/[business-id]/time-tracking/time-entries/get'
import {
  type CreateTimeEntryBody,
  UPSERT_TIME_ENTRY_TAG_KEY,
  type UpsertTimeEntryReturnEncoded,
  UpsertTimeEntryReturnSchema,
} from '@api/businesses/[business-id]/time-tracking/time-entries/post'
import { useTimeTrackingSummaryGlobalCacheActions } from '@api/businesses/[business-id]/time-tracking/time-entries/summary/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

export type UpdateTimeEntryBody = Partial<CreateTimeEntryBody>

const updateTimeEntry = patch<
  UpsertTimeEntryReturnEncoded,
  UpdateTimeEntryBody,
  { businessId: string, timeEntryId: string }
>(
  ({ businessId, timeEntryId }) => `/v1/businesses/${businessId}/time-tracking/time-entries/${timeEntryId}`,
)

export const usePatchTimeEntry = createMutationHook({
  tags: [UPSERT_TIME_ENTRY_TAG_KEY],
  request: updateTimeEntry,
  keyParams: ['timeEntryId'],
  schema: UpsertTimeEntryReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchByKey: patchTimeEntryByKey } = useTimeEntriesGlobalCacheActions()
    const { invalidate: invalidateTimeTrackingSummary } = useTimeTrackingSummaryGlobalCacheActions()

    return (data) => {
      void patchTimeEntryByKey(data)
      void invalidateTimeTrackingSummary()
    }
  },
})
