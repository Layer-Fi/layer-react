import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { CustomAccountSchema, type RawCustomAccount } from '@schemas/features/customAccounts/customAccount'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useBankAccountsGlobalCacheActions } from '@api/businesses/[business-id]/bank-accounts/get'
import { CUSTOM_ACCOUNTS_TAG_KEY, useCustomAccountsGlobalCacheActions } from '@api/businesses/[business-id]/custom-accounts/get'

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
