import useSWRMutation from 'swr/mutation'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useSWRConfig } from 'swr'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { BUSINESS_PERSONNEL_TAG_KEY } from '@hooks/businessPersonnel/useBusinessPersonnel'
import {
  updateBusinessPersonnel,
  type UpdateBusinessPersonnelBody,
} from '@api/layer/businessPersonnel/updateBusinessPersonnel'
import { useCallback } from 'react'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  businessPersonnelId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  businessPersonnelId?: string
}) {
  if (accessToken && apiUrl && businessPersonnelId) {
    return {
      accessToken,
      apiUrl,
      businessId,
      businessPersonnelId,
      tags: [`${BUSINESS_PERSONNEL_TAG_KEY}:${businessPersonnelId}`],
    } as const
  }
}

export function useUpdateBusinessPersonnel({ businessPersonnelId }: { businessPersonnelId?: string }) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      businessPersonnelId,
    }),
    (
      { accessToken, apiUrl, businessId, businessPersonnelId },
      { arg: body }: { arg: UpdateBusinessPersonnelBody },
    ) => updateBusinessPersonnel(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          businessPersonnelId,
        },
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
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        tags => tags.includes(BUSINESS_PERSONNEL_TAG_KEY),
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
