import { Schema } from 'effect'

import { type Customer, UpsertCustomerSchema } from '@schemas/customer'

import { createUpsertRequestEcho } from '@msw/utils/createEchoResolvers'

export const customerFromUpsertRequest = createUpsertRequestEcho<Customer>(
  Schema.decodeUnknownSync(UpsertCustomerSchema),
)
