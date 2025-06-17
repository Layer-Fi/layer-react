import { CustomerSchema } from '../customers/customersSchemas'
import { VendorSchema } from '../vendors/vendorsSchemas'
import { Schema } from 'effect'

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
