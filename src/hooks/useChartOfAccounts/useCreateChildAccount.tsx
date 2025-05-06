import useSWRMutation from 'swr/mutation'
import { useAuth } from '../useAuth'
import { useLayerContext } from '../../contexts/LayerContext'
import { createChildAccount } from '../../api/layer/chart_of_accounts'
import { useSWRConfig } from 'swr'
import { withSWRKeyTags } from '../../utils/swr/withSWRKeyTags'
import { useCallback } from 'react'
import { NewChildAccount } from '../../types/chart_of_accounts'
import { CATEGORIES_TAG_KEY } from '../categories/useCategories'

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
      tags: ['#create-child-account'],
    } as const
  }
}

type NewChildAccountWithParentAccountId = NewChildAccount & { accountId: string }
export function useCreateChildAccount() {
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
      { arg: { accountId, ...requestBody } }: { arg: NewChildAccountWithParentAccountId },
    ) => createChildAccount(apiUrl, accessToken, {
      params: {
        businessId,
        accountId,
      },
      body: requestBody,
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
      const result = await originalTrigger(...triggerParameters)

      if (result) {
        await mutate(key => withSWRKeyTags(
          key,
          tags => tags.includes(CATEGORIES_TAG_KEY),
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
  })
}
