import type { FileMetadata } from '@internal-types/fileUpload'
import { postWithFormData } from '@utils/api/authenticatedHttp'
import { useBookkeepingPeriodsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

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
  return postWithFormData<{ data: FileMetadata }>(
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

export const useUploadDocumentsForTask = createMutationHook({
  tags: ['#use-upload-documents-for-task'],
  request: completeTaskWithUpload,
  argToParams: ({ taskId }: UseUploadDocumentsForTaskArg) => ({ taskId }),
  argToBody: ({ files, description }: UseUploadDocumentsForTaskArg) => ({ files, description }),
  swrOptions: { throwOnError: false },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadBookkeepingPeriods } = useBookkeepingPeriodsGlobalCacheActions()

    return () => {
      void forceReloadBookkeepingPeriods()
    }
  },
})
