import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import type { BusinessTaskEncoded } from '@schemas/businessTasks/businessTask'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { BOOKKEEPING_PERIODS_TAG_KEY } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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

const buildKey = createBuildKey<{ businessId: string }>(['#delete-uploads-on-task'])

type UseDeleteUploadsOnTaskArg = {
  taskId: string
}

export function useDeleteUploadsOnTask() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: { taskId } }: { arg: UseDeleteUploadsOnTaskArg },
    ) => deleteUploadsOnTask(
      apiUrl,
      accessToken,
      {
        params: { businessId, taskId },
      },
    ),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

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
