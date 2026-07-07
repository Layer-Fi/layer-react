import { Schema } from 'effect'

import { type Customer, CustomerSchema } from '@schemas/customer'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeCustomer } from '@fixtures/customers/mocks'

const encodeCustomer = Schema.encodeSync(CustomerSchema)

export const toCreateCustomerResponse = (customer: Customer) =>
  apiData(encodeCustomer(customer))

export const post = createMockEndpoint<Customer, ReturnType<typeof toCreateCustomerResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/customers',
  resolve: ({ override: customer = makeCustomer() }) => toCreateCustomerResponse(customer),
})
