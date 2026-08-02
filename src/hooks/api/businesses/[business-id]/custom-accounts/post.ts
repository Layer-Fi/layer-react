import { CustomAccountSchema, type RawCustomAccount } from '@schemas/customAccounts'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { useBankAccountsGlobalCacheActions } from '@api/businesses/[business-id]/bank-accounts/get'
import { CUSTOM_ACCOUNTS_TAG_KEY, useCustomAccountsGlobalCacheActions } from '@api/businesses/[business-id]/custom-accounts/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

type CreateCustomAccountBody = Pick<
  RawCustomAccount,
  'account_name'
  | 'account_type'
  | 'account_subtype'
  | 'custom_account_type'
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

export const usePostCustomAccount = createMutationHook({
  tags: [`${CUSTOM_ACCOUNTS_TAG_KEY}:create`],
  request: createCustomAccount,
  schema: CreateCustomAccountResponseSchema,
  useOnTriggerSuccess: () => {
    const { invalidate: invalidateCustomAccounts } = useCustomAccountsGlobalCacheActions()
    const { invalidate: invalidateBankAccounts } = useBankAccountsGlobalCacheActions()

    return () => {
      void invalidateCustomAccounts()
      void invalidateBankAccounts()
    }
  },
})
