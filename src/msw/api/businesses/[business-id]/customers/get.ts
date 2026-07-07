import { Schema } from 'effect'

import { type Customer, CustomerSchema } from '@schemas/customer'

import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { customers as defaultCustomers } from '@fixtures/generated/customers.gen'

const encodeCustomer = Schema.encodeSync(CustomerSchema)

const toResponse = (customers: readonly Customer[]) => ({
  data: customers.map(customer => encodeCustomer(customer)),
  meta: {
    pagination: {
      cursor: null,
      has_more: false,
      total_count: customers.length,
    },
  },
})

export const get = createMockEndpoint<readonly Customer[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/customers',
  resolve: ({ override: customers = defaultCustomers, request }) => {
    const query = new URL(request.url).searchParams.get('q')?.toLowerCase()
    const filtered = query == null || query === ''
      ? customers
      : customers.filter(customer =>
        [customer.individualName, customer.companyName, customer.email]
          .some(field => field?.toLowerCase()?.includes(query) ?? false),
      )

    return toResponse(filtered)
  },
})
