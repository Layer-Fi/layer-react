import { Schema } from 'effect'

import { type Customer, UpsertCustomerSchema } from '@schemas/customer'

import { createRequestBodyEcho } from '@msw/utils/createRequestBodyEcho'

export const customerFromUpsertRequest = createRequestBodyEcho<Customer>(
  Schema.decodeUnknownSync(UpsertCustomerSchema),
)
