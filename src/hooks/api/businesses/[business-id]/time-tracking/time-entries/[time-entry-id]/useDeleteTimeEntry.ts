import { useCallback } from 'react'

import { del } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useTimeTrackingSummaryGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/summary/useTimeTrackingSummary'
import { useTimeEntriesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useListTimeEntries'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const DELETE_TIME_ENTRY_TAG_KEY = '#delete-time-entry'

const deleteTimeEntry = del<
  Record<string, never>,
  Record<string, never>,
  { businessId: string, timeEntryId?: string }
>(({ businessId, timeEntryId }) => `/v1/businesses/${businessId}/time-tracking/time-entries/${timeEntryId}`)

const useDeleteTimeEntryMutation = createMutationHook({
  tags: [DELETE_TIME_ENTRY_TAG_KEY],
  request: deleteTimeEntry,
  keyParams: ['timeEntryId'],
  argToBody: (_arg: never) => undefined,
  swrOptions: { throwOnError: true },
})

type UseDeleteTimeEntryProps = {
  timeEntryId: string | undefined
}

export const useDeleteTimeEntry = ({ timeEntryId }: UseDeleteTimeEntryProps) => {
  const mutationResponse = useDeleteTimeEntryMutation({
    timeEntryId,
    isEnabled: Boolean(timeEntryId),
  })

  const { forceReload: forceReloadTimeEntries } = useTimeEntriesGlobalCacheActions()
  const { invalidate: invalidateTimeTrackingSummary } = useTimeTrackingSummaryGlobalCacheActions()
  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void forceReloadTimeEntries()
      void invalidateTimeTrackingSummary()

      return triggerResult
    },
    [originalTrigger, forceReloadTimeEntries, invalidateTimeTrackingSummary],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
