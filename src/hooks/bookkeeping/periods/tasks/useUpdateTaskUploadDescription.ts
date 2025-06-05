import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'
import { useAuth } from '../../../useAuth'
import { useLayerContext } from '../../../../contexts/LayerContext'
import { updateTaskUploadsDescription } from '../../../../api/layer/tasks'
import { withSWRKeyTags } from '../../../../utils/swr/withSWRKeyTags'
import { BOOKKEEPING_PERIODS_TAG_KEY } from '../useBookkeepingPeriods'
import { useCallback } from 'react'

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
        tags => tags.includes(BOOKKEEPING_PERIODS_TAG_KEY),
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
