import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { post } from '@api/layer/authenticated_http'
import { BANK_ACCOUNTS_TAG_KEY } from '@hooks/bookkeeping/useBankAccounts'
import { mapRawCustomAccountToCustomAccount, type RawCustomAccount } from '@hooks/customAccounts/types'
import { CUSTOM_ACCOUNTS_TAG_KEY } from '@hooks/customAccounts/useCustomAccounts'
import { useAuth } from '@hooks/useAuth'
import { EXTERNAL_ACCOUNTS_TAG_KEY } from '@hooks/useLinkedAccounts/useListExternalAccounts'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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
        ({ tags }) => tags.includes(CUSTOM_ACCOUNTS_TAG_KEY)
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
