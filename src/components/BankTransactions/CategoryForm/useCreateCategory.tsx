// import useSWRMutation from 'swr/mutation'
// import { Layer } from '../../../api/layer'
// import { useCallback } from 'react'
// import { withSWRKeyTags } from '../../../utils/swr/withSWRKeyTags'
import type { Awaitable } from '../../../types/utility/promises'
import { useAuth } from '../../../hooks/useAuth'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useSWRConfig } from 'swr'

export type CreateCategoryBody = { parent_category_id?: string, name: string, description?: string }

const CREATE_CATEGORY_TAG_KEY = '#create-category'

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
      tags: [CREATE_CATEGORY_TAG_KEY],
    }
  }
}

export function useCreateCategory({ onSuccess }: { onSuccess?: () => Awaitable<unknown> }) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  /* const mutationResponse = useSWRMutation(
    () => buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: CreateCategoryBody },
    ) => Layer.TODO_CREATE_CATEGORY(apiUrl, accessToken,
      {
        params: { businessId },
        body,
      },
    ).then(({ data }) => {
      onSuccess?.()
      return data
    }),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const result = await originalTrigger(...triggerParameters)

      if (result) {
        await mutate(key => withSWRKeyTags(
          key,
          tags => tags.includes(GET_CATEGORIES_TAG_KEY),
        ))
      }

      return result
    },
    [originalTrigger, mutate],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  }) */
  return {
    trigger: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      onSuccess?.()
    },
    isMutating: false,
    apiError: false,
  }
}
