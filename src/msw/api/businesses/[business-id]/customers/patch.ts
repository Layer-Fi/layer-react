import { Schema } from 'effect'

import { type Customer, CustomerSchema } from '@schemas/customer'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeCustomer } from '@fixtures/customers/mocks'

const encodeCustomer = Schema.encodeSync(CustomerSchema)

export const toUpdateCustomerResponse = (customer: Customer) =>
  apiData(encodeCustomer(customer))

export const patch = createMockEndpoint<Customer, ReturnType<typeof toUpdateCustomerResponse>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/customers/:customerId',
  resolve: ({ override: customer = makeCustomer(), params }) =>
    toUpdateCustomerResponse({ ...customer, id: params.customerId as string }),
})
