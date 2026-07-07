import { Schema } from 'effect'

import { type Customer, CustomerSchema } from '@schemas/customer'

import { customerFromUpsertRequest } from '@msw/api/businesses/[business-id]/customers/customerFromUpsertRequest'
import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreUpdateResolver } from '@msw/utils/createStoreResolvers'
import { makeCustomer } from '@fixtures/customers/mocks'

const encodeCustomer = Schema.encodeSync(CustomerSchema)

export const toUpdateCustomerResponse = (customer: Customer) =>
  apiData(encodeCustomer(customer))

export const patch = createMockEndpoint<Customer, ReturnType<typeof toUpdateCustomerResponse>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/customers/:customerId',
  resolve: createStoreUpdateResolver({
    idParam: 'customerId',
    store: customerStore,
    makeBase: id => makeCustomer({ id }),
    fromRequest: customerFromUpsertRequest,
    toResponse: toUpdateCustomerResponse,
  }),
})
