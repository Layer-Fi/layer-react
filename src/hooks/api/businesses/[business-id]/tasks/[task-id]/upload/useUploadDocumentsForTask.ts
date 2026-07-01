import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import type { FileMetadata } from '@internal-types/fileUpload'
import { postWithFormData } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { BOOKKEEPING_PERIODS_TAG_KEY } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

function completeTaskWithUpload(
  baseUrl: string,
  accessToken: string,
  {
    businessId,
    taskId,
    files,
    description,
  }: {
    businessId: string
    taskId: string
    files: ReadonlyArray<File>
    description?: string
  },
) {
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

const buildKey = createBuildKey<{ businessId: string }>(['#use-upload-documents-for-task'])

type UseUploadDocumentsForTaskArg = {
  taskId: string
  files: ReadonlyArray<File>
  description?: string
}

export function useUploadDocumentsForTask() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: { taskId, files, description } }: { arg: UseUploadDocumentsForTaskArg },
    ) => completeTaskWithUpload(
      apiUrl,
      accessToken,
      {
        businessId,
        taskId,
        files,
        description,
      },
    ),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

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
