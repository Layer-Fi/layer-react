import { CustomAccountSchema, type RawCustomAccount } from '@schemas/customAccounts'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
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

export const useCreateCustomAccount = createMutationHook({
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
