import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { ApiLinkTokenSchema } from '@schemas/linkedAccounts/plaid'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const CREATE_PLAID_UPDATE_MODE_LINK_TAG_KEY = '#create-plaid-update-mode-link'

const CreatePlaidUpdateModeLinkReturnSchema = Schema.Struct({
  data: ApiLinkTokenSchema,
})
type CreatePlaidUpdateModeLinkReturn = typeof CreatePlaidUpdateModeLinkReturnSchema.Type

type CreatePlaidUpdateModeLinkBody = {
  plaid_item_id: string
}

const createPlaidUpdateModeLink = post<
  CreatePlaidUpdateModeLinkReturn,
  CreatePlaidUpdateModeLinkBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/update-mode-link`)

const buildKey = createBuildKey<{ businessId: string }>([CREATE_PLAID_UPDATE_MODE_LINK_TAG_KEY])

export function useCreatePlaidUpdateModeLink() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: { plaidItemId } }: { arg: { plaidItemId: string } },
    ) => createPlaidUpdateModeLink(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body: { plaid_item_id: plaidItemId },
      },
    )
      .then(Schema.decodeUnknownPromise(CreatePlaidUpdateModeLinkReturnSchema))
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

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
