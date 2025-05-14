import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'
import { useAuth } from '../../../useAuth'
import { useLayerContext } from '../../../../contexts/LayerContext'
import { submitUserResponseForTask } from '../../../../api/layer/tasks'
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
      tags: ['#submit-user-response-for-task'],
    } as const
  }
}

type UseSubmitUserResponseForTaskArg = {
  taskId: string
  userResponse: string
}

export function useSubmitUserResponseForTask() {
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
      { arg: { taskId, userResponse } }: { arg: UseSubmitUserResponseForTaskArg },
    ) => submitUserResponseForTask(
      apiUrl,
      accessToken,
      {
        body: {
          type: 'FreeResponse',
          user_response: userResponse,
        },
        params: {
          businessId,
          taskId,
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
    async (...triggerParameters: Parameters<typeof originalTrigger>) =>
      originalTrigger(...triggerParameters)
        .finally(() => {
          void mutate(key => withSWRKeyTags(
            key,
            tags => tags.includes(BOOKKEEPING_PERIODS_TAG_KEY),
          ))
        }),
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
