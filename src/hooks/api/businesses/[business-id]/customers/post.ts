import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { CustomerSchema } from '@schemas/features/customerVendor/customer'
import { type UpsertCustomerEncoded } from '@schemas/features/customerVendor/upsertCustomer'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { CUSTOMERS_TAG_KEY, useCustomersGlobalCacheActions } from '@api/businesses/[business-id]/customers/get'

export const UPSERT_CUSTOMER_TAG_KEY = '#upsert-customer'

export type UpsertCustomerBody = UpsertCustomerEncoded

export const UpsertCustomerReturnSchema = UnwrappedDataResponseSchema(CustomerSchema)

export type UpsertCustomerReturnEncoded = typeof UpsertCustomerReturnSchema.Encoded

const createCustomer = post<UpsertCustomerReturnEncoded, UpsertCustomerBody>(
  ({ businessId }) => `/v1/businesses/${businessId}/customers`,
)

export const usePostCustomer = createMutationHook({
  tags: [UPSERT_CUSTOMER_TAG_KEY, CUSTOMERS_TAG_KEY],
  request: createCustomer,
  schema: UpsertCustomerReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadCustomers } = useCustomersGlobalCacheActions()

    return () => {
      void forceReloadCustomers()
    }
  },
})
