import { usePatchCustomer } from '@api/businesses/[business-id]/customers/[customer-id]/patch'
import { usePostCustomer } from '@api/businesses/[business-id]/customers/post'

export enum UpsertCustomerMode {
  Create = 'Create',
  Update = 'Update',
}

type UseUpsertCustomerProps =
  | { mode: UpsertCustomerMode.Create }
  | { mode: UpsertCustomerMode.Update, customerId: string }

export const useUpsertCustomer = (props: UseUpsertCustomerProps) => {
  const { mode } = props
  const customerId = mode === UpsertCustomerMode.Update ? props.customerId : undefined

  const createResponse = usePostCustomer()
  const updateResponse = usePatchCustomer({
    customerId: customerId ?? '',
  })

  return mode === UpsertCustomerMode.Create ? createResponse : updateResponse
}
