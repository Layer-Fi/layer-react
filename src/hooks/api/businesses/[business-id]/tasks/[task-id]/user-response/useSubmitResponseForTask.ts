import type { BusinessTaskEncoded } from '@schemas/businessTasks/businessTask'
import { post } from '@utils/api/authenticatedHttp'
import { useBookkeepingPeriodsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
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

export const useSubmitUserResponseForTask = createMutationHook({
  tags: ['#submit-user-response-for-task'],
  request: submitUserResponseForTask,
  argToParams: ({ taskId }: UseSubmitUserResponseForTaskArg) => ({ taskId }),
  argToBody: ({ userResponse }: UseSubmitUserResponseForTaskArg) => ({
    type: 'FreeResponse' as const,
    user_response: userResponse,
  }),
  swrOptions: { throwOnError: false },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()

    return () => {
      void forceReloadBookkeepingPeriods()
    }
  },
})
