import { createUpsertHook } from '@hooks/utils/swr/createUpsertHook'
import { usePatchCustomer } from '@api/businesses/[business-id]/customers/[customer-id]/patch'
import { usePostCustomer } from '@api/businesses/[business-id]/customers/post'

export const useUpsertCustomer = createUpsertHook({
  useCreate: usePostCustomer,
  useUpdate: usePatchCustomer,
  toCreateOptions: () => undefined,
  toUpdateOptions: (props: { customerId: string }) => ({ customerId: props.customerId }),
})
