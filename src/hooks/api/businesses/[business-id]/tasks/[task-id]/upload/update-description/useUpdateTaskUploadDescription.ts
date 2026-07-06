import { useCallback } from 'react'
import { useSWRConfig } from 'swr'

import type { BusinessTaskEncoded } from '@schemas/businessTasks/businessTask'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { BOOKKEEPING_PERIODS_TAG_KEY } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

type UpdateTaskUploadsDescriptionBody = {
  type: 'FreeResponse'
  user_response: string
}

const updateTaskUploadsDescription = post<
  { data: BusinessTaskEncoded },
  UpdateTaskUploadsDescriptionBody,
  {
    businessId: string
    taskId: string
  }
>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/upload/update-description`,
)

type UseUpdateTaskUploadDescriptionArg = {
  taskId: string
  description: string
}

const useUpdateTaskUploadDescriptionMutation = createMutationHook({
  tags: ['#update-task-upload-description'],
  request: updateTaskUploadsDescription,
  argToParams: ({ taskId }: UseUpdateTaskUploadDescriptionArg) => ({ taskId }),
  argToBody: ({ description }: UseUpdateTaskUploadDescriptionArg) => ({
    type: 'FreeResponse' as const,
    user_response: description,
  }),
  swrOptions: { throwOnError: false },
})

export function useUpdateTaskUploadDescription() {
  const { mutate } = useSWRConfig()

  const mutationResponse = useUpdateTaskUploadDescriptionMutation()

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
