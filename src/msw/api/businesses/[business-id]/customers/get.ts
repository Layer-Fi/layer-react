import { Schema } from 'effect'

import { type Customer, CustomerSchema } from '@schemas/customer'

import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesQuery } from '@msw/utils/createListFilter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeCustomer = Schema.encodeSync(CustomerSchema)

const toResponse = (customers: readonly Customer[], request: Request) =>
  paginatedApiData(customers.map(customer => encodeCustomer(customer)), request)

const filterCustomers = createListFilter<Customer>({
  q: matchesQuery(customer => [customer.individualName, customer.companyName, customer.email]),
})

export const get = createMockEndpoint<readonly Customer[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/customers',
  resolve: ({ override: customers = customerStore.all(), request }) =>
    toResponse(filterCustomers(customers, request), request),
})
