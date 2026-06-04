import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import {
  ApiLinkTokenSchema,
  type CreatePlaidLinkParams,
  type CreatePlaidLinkParamsEncoded,
  encodeCreatePlaidLinkParams,
} from '@schemas/linkedAccounts/plaid'
import { post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const CREATE_PLAID_LINK_TAG_KEY = '#create-plaid-link'

const CreatePlaidLinkReturnSchema = Schema.Struct({
  data: ApiLinkTokenSchema,
})
type CreatePlaidLinkReturn = typeof CreatePlaidLinkReturnSchema.Type

const createPlaidLink = post<
  CreatePlaidLinkReturn,
  CreatePlaidLinkParamsEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link`)

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
      tags: [CREATE_PLAID_LINK_TAG_KEY],
    } as const
  }
}

export function useCreatePlaidLink() {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: params }: { arg: CreatePlaidLinkParams },
    ) => createPlaidLink(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body: encodeCreatePlaidLinkParams(params),
      },
    )
      .then(Schema.decodeUnknownPromise(CreatePlaidLinkReturnSchema))
      .then(({ data }) => data),
    {
      revalidate: false,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    (...triggerParameters: Parameters<typeof originalTrigger>) =>
      originalTrigger(...triggerParameters),
    [originalTrigger],
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
