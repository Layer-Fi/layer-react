import { pipe, Schema } from 'effect'

import { CustomAccountSchema } from '@schemas/customAccounts'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'

export const CUSTOM_ACCOUNTS_TAG_KEY = '#custom-accounts'

const CustomAccountsDataSchema = Schema.Struct({
  customAccounts: pipe(
    Schema.propertySignature(Schema.Array(CustomAccountSchema)),
    Schema.fromKey('custom_accounts'),
  ),
})

const GetCustomAccountsResponseSchema = UnwrappedDataResponseSchema(CustomAccountsDataSchema)

type GetCustomAccountsParams = {
  businessId: string
  userCreated?: boolean
}

const getCustomAccounts = getWithQuery<
  typeof GetCustomAccountsResponseSchema.Encoded,
  GetCustomAccountsParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/custom-accounts`,
)

export const useCustomAccounts = createQueryHook({
  tags: [CUSTOM_ACCOUNTS_TAG_KEY],
  request: getCustomAccounts,
  schema: GetCustomAccountsResponseSchema,
  select: ({ customAccounts }) => customAccounts,
})

export const useCustomAccountsGlobalCacheActions =
  createResourceGlobalCacheActions<ReadonlyArray<typeof CustomAccountSchema.Type>>(CUSTOM_ACCOUNTS_TAG_KEY)
