import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'
import { post } from '../../api/layer/authenticated_http'
import { type RawCustomAccount, mapRawCustomAccountToCustomAccount } from './types'
import { useAuth } from '../useAuth'
import { useLayerContext } from '../../contexts/LayerContext'
import { useSWRConfig } from 'swr'
import { withSWRKeyTags } from '../../utils/swr/withSWRKeyTags'
import { CUSTOM_ACCOUNTS_TAG_KEY } from './useCustomAccounts'
import { BANK_ACCOUNTS_TAG_KEY } from '../bookkeeping/useBankAccounts'
import { EXTERNAL_ACCOUNTS_TAG_KEY } from '../useLinkedAccounts/useListExternalAccounts'

type CreateCustomAccountBody = Pick<
  RawCustomAccount,
  'account_name'
  | 'account_type'
  | 'account_subtype'
  | 'institution_name'
  | 'external_id'
  | 'mask'
  | 'user_created'
>

const createCustomAccount = post<
  { data: RawCustomAccount },
  CreateCustomAccountBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/custom-accounts`)

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
      tags: [`${CUSTOM_ACCOUNTS_TAG_KEY}:create`],
    } as const
  }
}

export function useCreateCustomAccount() {
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
      { arg: body }: { arg: CreateCustomAccountBody },
    ) => createCustomAccount(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body,
      },
    ).then(({ data }) => mapRawCustomAccountToCustomAccount(data)),
    {
      revalidate: false,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        tags => tags.includes(CUSTOM_ACCOUNTS_TAG_KEY)
          || tags.includes(BANK_ACCOUNTS_TAG_KEY)
          || tags.includes(EXTERNAL_ACCOUNTS_TAG_KEY),
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
