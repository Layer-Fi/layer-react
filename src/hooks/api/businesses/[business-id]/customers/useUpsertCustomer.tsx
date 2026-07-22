import { CustomerSchema, type UpsertCustomerEncoded } from '@schemas/customer'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { patch, post } from '@utils/api/authenticatedHttp'
import { useCustomersGlobalCacheActions } from '@hooks/api/businesses/[business-id]/customers/useListCustomers'
import { useInvoicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_CUSTOMER_TAG_KEY = '#upsert-customer'

export enum UpsertCustomerMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertCustomerBody = UpsertCustomerEncoded

const UpsertCustomerReturnSchema = UnwrappedDataResponseSchema(CustomerSchema)

type UpsertCustomerReturnEncoded = typeof UpsertCustomerReturnSchema.Encoded

const createCustomer = post<UpsertCustomerReturnEncoded, UpsertCustomerBody>(
  ({ businessId }) => `/v1/businesses/${businessId}/customers`,
)

const updateCustomer = patch<
  UpsertCustomerReturnEncoded,
  UpsertCustomerBody,
  { businessId: string, customerId: string }
>(({ businessId, customerId }) => `/v1/businesses/${businessId}/customers/${customerId}`)

const useCreateCustomer = createMutationHook({
  tags: [UPSERT_CUSTOMER_TAG_KEY],
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

const useUpdateCustomer = createMutationHook({
  tags: [UPSERT_CUSTOMER_TAG_KEY],
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

type UseUpsertCustomerProps =
  | { mode: UpsertCustomerMode.Create }
  | { mode: UpsertCustomerMode.Update, customerId: string }

export const useUpsertCustomer = (props: UseUpsertCustomerProps) => {
  const { mode } = props
  const customerId = mode === UpsertCustomerMode.Update ? props.customerId : undefined

  const createResponse = useCreateCustomer()
  const updateResponse = useUpdateCustomer({
    customerId: customerId ?? '',
  })

  return mode === UpsertCustomerMode.Create ? createResponse : updateResponse
}
