import { useCallback } from 'react'
import { useSWRConfig } from 'swr'

import type { FileMetadata } from '@internal-types/fileUpload'
import { postWithFormData } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { BOOKKEEPING_PERIODS_TAG_KEY } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
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

const useUploadDocumentsForTaskMutation = createMutationHook({
  tags: ['#use-upload-documents-for-task'],
  request: completeTaskWithUpload,
  argToParams: ({ taskId }: UseUploadDocumentsForTaskArg) => ({ taskId }),
  argToBody: ({ files, description }: UseUploadDocumentsForTaskArg) => ({ files, description }),
  swrOptions: { throwOnError: false },
})

export function useUploadDocumentsForTask() {
  const { mutate } = useSWRConfig()

  const mutationResponse = useUploadDocumentsForTaskMutation()

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
