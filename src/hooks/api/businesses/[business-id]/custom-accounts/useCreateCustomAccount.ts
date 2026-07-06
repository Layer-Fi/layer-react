import { useCallback } from 'react'

import { CustomAccountSchema, type RawCustomAccount } from '@schemas/customAccounts'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankAccountsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { CUSTOM_ACCOUNTS_TAG_KEY, useCustomAccountsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
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

const CreateCustomAccountResponseSchema = UnwrappedDataResponseSchema(CustomAccountSchema)

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
  const { invalidate: invalidateCustomAccounts } = useCustomAccountsGlobalCacheActions()
  const { invalidate: invalidateBankAccounts } = useBankAccountsGlobalCacheActions()

  const mutationResponse = useCreateCustomAccountMutation()
  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const data = await originalTrigger(...triggerParameters)

      void invalidateCustomAccounts()
      void invalidateBankAccounts()

      return data
    },
    [
      originalTrigger,
      invalidateCustomAccounts,
      invalidateBankAccounts,
    ],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
