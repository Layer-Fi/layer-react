import useSWRMutation from 'swr/mutation'
import { useAuth } from '../useAuth'
import { useLayerContext } from '../../contexts/LayerContext'
import {
  updateBusiness,
  type UpdateBusinessBody,
} from '../../api/layer/business'
import { useSWRConfig } from 'swr'
import { withSWRKeyTags } from '../../utils/swr/withSWRKeyTags'
import { useCallback } from 'react'

export const BUSINESS_TAG_KEY = 'business'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl && businessId) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [`${BUSINESS_TAG_KEY}:${businessId}`],
    } as const
  }
}

export function useUpdateBusiness() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: UpdateBusinessBody },
    ) => updateBusiness(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body,
      },
    ).then(({ data }) => data),
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
            tags => tags.includes(BUSINESS_TAG_KEY),
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
