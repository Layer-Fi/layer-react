import useSWRMutation from 'swr/mutation'
import { useAuth } from '../useAuth'
import { useLayerContext } from '../../contexts/LayerContext'
import { createChildAccount } from '../../api/layer/chart_of_accounts'
import { useSWRConfig } from 'swr'
import { withSWRKeyTags } from '../../utils/swr/withSWRKeyTags'
import { useCallback } from 'react'
import { NewChildAccount } from '../../types/chart_of_accounts'

export const CREATE_CHILD_ACCOUNT_TAG_KEY = '#create-child-account'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  accountId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  accountId: string
}) {
  if (accessToken && apiUrl && businessId && accountId) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [`${CREATE_CHILD_ACCOUNT_TAG_KEY}:${accountId}`],
    } as const
  }
}

export function useCreateChildAccount({ accountId }: { accountId: string }) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      accountId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: NewChildAccount },
    ) => createChildAccount(apiUrl, accessToken, {
      params: {
        businessId,
        accountId,
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
      const result = await originalTrigger(...triggerParameters)

      if (result) {
        await mutate(key => withSWRKeyTags(
          key,
          tags => tags.includes(CREATE_CHILD_ACCOUNT_TAG_KEY),
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
