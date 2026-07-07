import { Schema } from 'effect'

import { type Customer, CustomerSchema } from '@schemas/customer'

import { customerFromUpsertRequest } from '@msw/api/businesses/[business-id]/customers/customerFromUpsertRequest'
import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreCreateResolver } from '@msw/utils/createStoreResolvers'
import { makeCustomer } from '@fixtures/customers/mocks'

const encodeCustomer = Schema.encodeSync(CustomerSchema)

export const toCreateCustomerResponse = (customer: Customer) =>
  apiData(encodeCustomer(customer))

export const post = createMockEndpoint<Customer, ReturnType<typeof toCreateCustomerResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/customers',
  resolve: createStoreCreateResolver({
    store: customerStore,
    makeBase: id => makeCustomer({ id }),
    fromRequest: customerFromUpsertRequest,
    toResponse: toCreateCustomerResponse,
  }),
})
