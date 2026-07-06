import type { BusinessTaskEncoded } from '@schemas/businessTasks/businessTask'
import { post } from '@utils/api/authenticatedHttp'
import { useBookkeepingPeriodsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
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

export const useUpdateTaskUploadDescription = createMutationHook({
  tags: ['#update-task-upload-description'],
  request: updateTaskUploadsDescription,
  argToParams: ({ taskId }: UseUpdateTaskUploadDescriptionArg) => ({ taskId }),
  argToBody: ({ description }: UseUpdateTaskUploadDescriptionArg) => ({
    type: 'FreeResponse' as const,
    user_response: description,
  }),
  swrOptions: { throwOnError: false },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()

    return () => {
      void forceReloadBookkeepingPeriods()
    }
  },
})
