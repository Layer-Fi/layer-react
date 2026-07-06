import { useCallback } from 'react'

import { CustomerSchema, type UpsertCustomerEncoded } from '@schemas/customer'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { patch, post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { CUSTOMERS_TAG_KEY, useCustomersGlobalCacheActions } from '@hooks/api/businesses/[business-id]/customers/useListCustomers'
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
  tags: [UPSERT_CUSTOMER_TAG_KEY, CUSTOMERS_TAG_KEY],
  request: createCustomer,
  schema: UpsertCustomerReturnSchema,
  swrOptions: { throwOnError: true },
})

const useUpdateCustomer = createMutationHook({
  tags: [UPSERT_CUSTOMER_TAG_KEY, CUSTOMERS_TAG_KEY],
  request: updateCustomer,
  keyParamNames: ['customerId'],
  schema: UpsertCustomerReturnSchema,
  swrOptions: { throwOnError: true },
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
    isEnabled: customerId !== undefined,
  })

  const mutationResponse = mode === UpsertCustomerMode.Create ? createResponse : updateResponse

  const { patchByKey: patchCustomerByKey, forceReload: forceReloadCustomers } = useCustomersGlobalCacheActions()
  const { forceReload: forceReloadInvoices } = useInvoicesGlobalCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      if (mode === UpsertCustomerMode.Update) {
        void patchCustomerByKey(triggerResult)
        void forceReloadInvoices()
      }
      else {
        void forceReloadCustomers()
      }

      return triggerResult
    },
    [originalTrigger, mode, patchCustomerByKey, forceReloadInvoices, forceReloadCustomers],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
