import { useCallback } from 'react'
import { Schema } from 'effect'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import { CustomAccountSchema, type RawCustomAccount } from '@schemas/customAccounts'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { BANK_ACCOUNTS_TAG_KEY } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { CUSTOM_ACCOUNTS_TAG_KEY } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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

const CreateCustomAccountResponseSchema = Schema.Struct({
  data: CustomAccountSchema,
})

const createCustomAccount = post<
  typeof CreateCustomAccountResponseSchema.Encoded,
  CreateCustomAccountBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/custom-accounts`)

const buildKey = createBuildKey<{ businessId: string }>([`${CUSTOM_ACCOUNTS_TAG_KEY}:create`])

export function useCreateCustomAccount() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
    })),
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
    )
      .then(Schema.decodeUnknownPromise(CreateCustomAccountResponseSchema))
      .then(({ data }) => data),
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
          || tags.includes(BANK_ACCOUNTS_TAG_KEY),
      ))

      return triggerResult
    },
    [
      originalTrigger,
      mutate,
    ],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
