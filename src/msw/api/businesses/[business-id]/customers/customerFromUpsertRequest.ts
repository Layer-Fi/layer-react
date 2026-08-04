import { Schema } from 'effect'

import { type Customer } from '@schemas/customerVendor/customer'
import { UpsertCustomerSchema } from '@schemas/customerVendor/upsertCustomer'

import { createRequestBodyEcho } from '@msw/utils/createRequestBodyEcho'

export const customerFromUpsertRequest = createRequestBodyEcho<Customer>(
  Schema.decodeUnknownSync(UpsertCustomerSchema),
)
