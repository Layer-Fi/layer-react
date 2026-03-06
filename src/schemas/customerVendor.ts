import { Schema } from 'effect'

import { CustomerSchema } from '@schemas/customer'
import { VendorSchema } from '@schemas/vendor'

export const CustomerVendorTypeSchema = Schema.Literal('CUSTOMER', 'VENDOR')

const DiscriminatedCustomerSchema = Schema.Struct({
  ...CustomerSchema.fields,
  customerVendorType: CustomerVendorTypeSchema.pipe(
    Schema.pickLiteral('CUSTOMER'),
  ),
})

const DiscriminatedVendorSchema = Schema.Struct({
  ...VendorSchema.fields,
  customerVendorType: CustomerVendorTypeSchema.pipe(
    Schema.pickLiteral('VENDOR'),
  ),
})

export const CustomerVendorSchema = Schema.Union(
  DiscriminatedCustomerSchema,
  DiscriminatedVendorSchema,
)

export const decodeCustomerVendor = Schema.decodeSync(CustomerVendorSchema)
