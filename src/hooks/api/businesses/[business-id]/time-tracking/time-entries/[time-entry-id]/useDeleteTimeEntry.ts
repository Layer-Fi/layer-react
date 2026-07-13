import { del } from '@utils/api/authenticatedHttp'
import { useTimeTrackingSummaryGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/summary/useTimeTrackingSummary'
import { useTimeEntriesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useListTimeEntries'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const DELETE_TIME_ENTRY_TAG_KEY = '#delete-time-entry'

const deleteTimeEntry = del<
  Record<string, never>,
  Record<string, never>,
  { businessId: string, timeEntryId: string }
>(({ businessId, timeEntryId }) => `/v1/businesses/${businessId}/time-tracking/time-entries/${timeEntryId}`)

export const useDeleteTimeEntry = createMutationHook({
  tags: [DELETE_TIME_ENTRY_TAG_KEY],
  request: deleteTimeEntry,
  keyParams: ['timeEntryId'],
  argToBody: (_arg: never) => undefined,
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
