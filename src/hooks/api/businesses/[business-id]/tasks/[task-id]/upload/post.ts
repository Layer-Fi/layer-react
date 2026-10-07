import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type BusinessTaskEncoded, BusinessTaskSchema } from '@schemas/features/bookkeeping/businessTask'
import { postWithFormData } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'

type UploadDocumentsForTaskParams = {
  businessId: string
  taskId: string
}

type UploadDocumentsForTaskBody = {
  files: ReadonlyArray<File>
  description?: string
}

function completeTaskWithUpload(
  baseUrl: string,
  accessToken: string | undefined,
  options?: {
    params?: UploadDocumentsForTaskParams
    body?: UploadDocumentsForTaskBody
  },
) {
  const { businessId, taskId } = options?.params ?? ({} as UploadDocumentsForTaskParams)
  const { files, description } = options?.body ?? ({} as UploadDocumentsForTaskBody)

  const formData = new FormData()
  files.forEach(file => formData.append('file', file))
  if (description) {
    formData.append('description', description)
  }

  const endpoint = `/v1/businesses/${businessId}/tasks/${taskId}/upload`
  return postWithFormData<{ data: BusinessTaskEncoded }>(
    endpoint,
    formData,
    baseUrl,
    accessToken,
  )
}

type UseUploadDocumentsForTaskArg = {
  taskId: string
  files: ReadonlyArray<File>
  description?: string
}

export const usePostTaskUpload = createMutationHook({
  tags: ['#use-upload-documents-for-task'],
  request: completeTaskWithUpload,
  schema: UnwrappedDataResponseSchema(BusinessTaskSchema),
  argToParams: ({ taskId }: UseUploadDocumentsForTaskArg) => ({ taskId }),
  argToBody: ({ files, description }: UseUploadDocumentsForTaskArg) => ({ files, description }),
  swrOptions: { throwOnError: false },
  useOnTriggerSuccess: () => {
    const { invalidate: invalidateBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()

    return () => {
      void invalidateBookkeepingPeriods()
    }
  },
})
