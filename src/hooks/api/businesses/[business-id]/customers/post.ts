import { CustomerSchema, type UpsertCustomerEncoded } from '@schemas/customerVendor/customer'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { CUSTOMERS_TAG_KEY, useCustomersGlobalCacheActions } from '@api/businesses/[business-id]/customers/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

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
