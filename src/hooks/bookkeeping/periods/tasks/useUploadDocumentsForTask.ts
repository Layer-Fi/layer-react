import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import type { FileMetadata } from '@internal-types/file_upload'
import { postWithFormData } from '@utils/authenticatedHttp'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'

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
import { BOOKKEEPING_PERIODS_TAG_KEY } from '@hooks/bookkeeping/periods/useBookkeepingPeriods'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: ['#use-upload-documents-for-task'],
    } as const
  }
}

type UseUploadDocumentsForTaskArg = {
  taskId: string
  files: ReadonlyArray<File>
  description?: string
}

export function useUploadDocumentsForTask() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...auth,
      businessId,
    }),
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

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
