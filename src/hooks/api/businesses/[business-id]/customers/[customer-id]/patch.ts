import { patch } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { CUSTOMERS_TAG_KEY, useCustomersGlobalCacheActions } from '@api/businesses/[business-id]/customers/get'
import {
  UPSERT_CUSTOMER_TAG_KEY,
  type UpsertCustomerBody,
  type UpsertCustomerReturnEncoded,
  UpsertCustomerReturnSchema,
} from '@api/businesses/[business-id]/customers/post'
import { useInvoicesGlobalCacheActions } from '@api/businesses/[business-id]/invoices/get'

const updateCustomer = patch<
  UpsertCustomerReturnEncoded,
  UpsertCustomerBody,
  { businessId: string, customerId: string }
>(({ businessId, customerId }) => `/v1/businesses/${businessId}/customers/${customerId}`)

export const usePatchCustomer = createMutationHook({
  tags: [UPSERT_CUSTOMER_TAG_KEY, CUSTOMERS_TAG_KEY],
  request: updateCustomer,
  keyParams: ['customerId'],
  schema: UpsertCustomerReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchByKey: patchCustomerByKey } = useCustomersGlobalCacheActions()
    const { forceReload: forceReloadInvoices } = useInvoicesGlobalCacheActions()

    return (data) => {
      void patchCustomerByKey(data)
      void forceReloadInvoices()
    }
  },
})
