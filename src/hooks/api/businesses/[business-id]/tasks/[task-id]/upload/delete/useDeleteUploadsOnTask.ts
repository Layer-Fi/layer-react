import { useCallback } from 'react'
import { useSWRConfig } from 'swr'

import type { BusinessTaskEncoded } from '@schemas/businessTasks/businessTask'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { BOOKKEEPING_PERIODS_TAG_KEY } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const deleteUploadsOnTask = post<
  { data: BusinessTaskEncoded },
  Record<string, never>,
  {
    businessId: string
    taskId: string
  }
>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/upload/delete`,
)

type UseDeleteUploadsOnTaskArg = {
  taskId: string
}

const useDeleteUploadsOnTaskMutation = createMutationHook({
  tags: ['#delete-uploads-on-task'],
  request: deleteUploadsOnTask,
  argToParams: (arg: UseDeleteUploadsOnTaskArg) => arg,
  argToBody: () => undefined,
  swrOptions: { throwOnError: false },
})

export function useDeleteUploadsOnTask() {
  const { mutate } = useSWRConfig()

  const mutationResponse = useDeleteUploadsOnTaskMutation()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        ({ tags }) => tags.includes(BOOKKEEPING_PERIODS_TAG_KEY),
      ))

      return triggerResult
    },
    [
      originalTrigger,
      mutate,
    ],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
