import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { del } from '@utils/api/authenticatedHttp'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useTimeTrackingSummaryGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/summary/useTimeTrackingSummary'
import { useTimeEntriesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useListTimeEntries'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const DELETE_TIME_ENTRY_TAG_KEY = '#delete-time-entry'

const deleteTimeEntry = del<
  Record<string, never>,
  { businessId: string, timeEntryId: string }
>(({ businessId, timeEntryId }) => `/v1/businesses/${businessId}/time-tracking/time-entries/${timeEntryId}`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  timeEntryId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  timeEntryId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      timeEntryId,
      tags: [DELETE_TIME_ENTRY_TAG_KEY],
    } as const
  }
}

type UseDeleteTimeEntryProps = {
  timeEntryId: string | undefined
}

export const useDeleteTimeEntry = ({ timeEntryId }: UseDeleteTimeEntryProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const rawMutationResponse = useSWRMutation(
    () => {
      if (!timeEntryId) {
        return undefined
      }

      return buildKey({
        ...data,
        businessId,
        timeEntryId,
      })
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

  const { forceReloadTimeEntries } = useTimeEntriesGlobalCacheActions()
  const { invalidateTimeTrackingSummary } = useTimeTrackingSummaryGlobalCacheActions()
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

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
