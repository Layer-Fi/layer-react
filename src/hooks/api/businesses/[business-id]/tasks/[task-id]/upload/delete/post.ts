import type { BusinessTaskEncoded } from '@schemas/features/bookkeeping/businessTask'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods/get'

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

export const useDeleteTaskUploads = createMutationHook({
  tags: ['#delete-uploads-on-task'],
  request: deleteUploadsOnTask,
  argToParams: (arg: UseDeleteUploadsOnTaskArg) => arg,
  argToBody: () => undefined,
  swrOptions: { throwOnError: false },
  useOnTriggerSuccess: () => {
    const { invalidate: invalidateBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()

    return () => {
      void invalidateBookkeepingPeriods()
    }
  },
})
