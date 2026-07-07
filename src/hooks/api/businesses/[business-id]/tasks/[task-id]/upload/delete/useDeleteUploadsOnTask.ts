import type { BusinessTaskEncoded } from '@schemas/businessTasks/businessTask'
import { post } from '@utils/api/authenticatedHttp'
import { useBookkeepingPeriodsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
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

export const useDeleteUploadsOnTask = createMutationHook({
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
