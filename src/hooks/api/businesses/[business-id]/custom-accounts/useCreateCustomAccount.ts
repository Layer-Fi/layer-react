import { useCallback } from 'react'
import { Schema } from 'effect'
import { useSWRConfig } from 'swr'

import { CustomAccountSchema, type RawCustomAccount } from '@schemas/customAccounts'
import { post } from '@utils/api/authenticatedHttp'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { BANK_ACCOUNTS_TAG_KEY } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { CUSTOM_ACCOUNTS_TAG_KEY } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

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

const useCreateCustomAccountMutation = createMutationHook({
  tags: [`${CUSTOM_ACCOUNTS_TAG_KEY}:create`],
  request: createCustomAccount,
  schema: CreateCustomAccountResponseSchema,
})

export function useCreateCustomAccount() {
  const { mutate } = useSWRConfig()

  const mutationResponse = useCreateCustomAccountMutation()
  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const { data } = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        ({ tags }) => tags.includes(CUSTOM_ACCOUNTS_TAG_KEY)
          || tags.includes(BANK_ACCOUNTS_TAG_KEY),
      ))

      return data
    },
    [
      originalTrigger,
      mutate,
    ],
  )

  return {
    trigger: stableProxiedTrigger,
    data: mutationResponse.data?.data,
    isError: mutationResponse.isError,
    isMutating: mutationResponse.isMutating,
  }
}
