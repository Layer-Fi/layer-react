import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import type { BusinessTaskEncoded } from '@schemas/businessTasks/businessTask'
import { post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { BOOKKEEPING_PERIODS_TAG_KEY } from '@hooks/api/businesses/[business-id]/bookkeeping/periods/useBookkeepingPeriods'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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
      tags: ['#update-task-upload-description'],
    } as const
  }
}

type UseUpdateTaskUploadDescriptionArg = {
  taskId: string
  description: string
}

export function useUpdateTaskUploadDescription() {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: { taskId, description } }: { arg: UseUpdateTaskUploadDescriptionArg },
    ) => updateTaskUploadsDescription(
      apiUrl,
      accessToken,
      {
        params: { businessId, taskId },
        body: {
          type: 'FreeResponse',
          user_response: description,
        },
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
