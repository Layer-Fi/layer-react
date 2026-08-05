import type { BusinessTaskEncoded } from '@schemas/features/bookkeeping/businessTask'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods/get'

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

export const usePostTaskUploadDescription = createMutationHook({
  tags: ['#update-task-upload-description'],
  request: updateTaskUploadsDescription,
  argToParams: ({ taskId }: UseUpdateTaskUploadDescriptionArg) => ({ taskId }),
  argToBody: ({ description }: UseUpdateTaskUploadDescriptionArg) => ({
    type: 'FreeResponse' as const,
    user_response: description,
  }),
  swrOptions: { throwOnError: false },
  useOnTriggerSuccess: () => {
    const { invalidate: invalidateBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()

    return () => {
      void invalidateBookkeepingPeriods()
    }
  },
})
