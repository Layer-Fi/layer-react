import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { del } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useTimeTrackingSummaryGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/summary/useTimeTrackingSummary'
import { useTimeEntriesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useListTimeEntries'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const DELETE_TIME_ENTRY_TAG_KEY = '#delete-time-entry'

const deleteTimeEntry = del<
  Record<string, never>,
  Record<string, never>,
  { businessId: string, timeEntryId: string }
>(({ businessId, timeEntryId }) => `/v1/businesses/${businessId}/time-tracking/time-entries/${timeEntryId}`)

const buildKey = createBuildKey<{ businessId: string, timeEntryId: string }>([DELETE_TIME_ENTRY_TAG_KEY])

type UseDeleteTimeEntryProps = {
  timeEntryId: string | undefined
}

export const useDeleteTimeEntry = ({ timeEntryId }: UseDeleteTimeEntryProps) => {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const rawMutationResponse = useSWRMutation(
    () => {
      if (!timeEntryId) {
        return undefined
      }

      return withLocale(buildKey({
        ...data,
        businessId,
        timeEntryId,
      }))
    },
    (
      { accessToken, apiUrl, businessId, timeEntryId },
    ) => {
      return deleteTimeEntry(
        apiUrl,
        accessToken,
        { params: { businessId, timeEntryId } },
      )
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

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
