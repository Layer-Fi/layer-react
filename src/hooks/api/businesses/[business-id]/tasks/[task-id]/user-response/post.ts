import type { BusinessTaskEncoded } from '@schemas/features/bookkeeping/businessTask'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods/get'

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

export const usePostTaskUserResponse = createMutationHook({
  tags: ['#submit-user-response-for-task'],
  request: submitUserResponseForTask,
  argToParams: ({ taskId }: UseSubmitUserResponseForTaskArg) => ({ taskId }),
  argToBody: ({ userResponse }: UseSubmitUserResponseForTaskArg) => ({
    type: 'FreeResponse' as const,
    user_response: userResponse,
  }),
  swrOptions: { throwOnError: false },
  useOnTriggerSuccess: () => {
    const { invalidate: invalidateBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()

    return () => {
      void invalidateBookkeepingPeriods()
    }
  },
})
