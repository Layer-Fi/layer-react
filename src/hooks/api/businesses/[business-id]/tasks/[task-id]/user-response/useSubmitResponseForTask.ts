import { useCallback } from 'react'
import { useSWRConfig } from 'swr'

import type { BusinessTaskEncoded } from '@schemas/businessTasks/businessTask'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { BOOKKEEPING_PERIODS_TAG_KEY } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

type SubmitUserResponseForTaskBody = {
  type: 'FreeResponse'
  user_response: string
}

const submitUserResponseForTask = post<
  { data: BusinessTaskEncoded },
  SubmitUserResponseForTaskBody,
  {
    businessId: string
    taskId: string
  }
>(
  ({ businessId, taskId }) => `/v1/businesses/${businessId}/tasks/${taskId}/user-response`,
)

type UseSubmitUserResponseForTaskArg = {
  taskId: string
  userResponse: string
}

const useSubmitUserResponseForTaskMutation = createMutationHook({
  tags: ['#submit-user-response-for-task'],
  request: submitUserResponseForTask,
  argToParams: ({ taskId }: UseSubmitUserResponseForTaskArg) => ({ taskId }),
  argToBody: ({ userResponse }: UseSubmitUserResponseForTaskArg) => ({
    type: 'FreeResponse' as const,
    user_response: userResponse,
  }),
  swrOptions: { throwOnError: false },
})

export function useSubmitUserResponseForTask() {
  const { mutate } = useSWRConfig()

  const mutationResponse = useSubmitUserResponseForTaskMutation()

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
