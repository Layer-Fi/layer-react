import { Schema } from 'effect'

import { type Customer, CustomerSchema } from '@schemas/customer'
import { type Vendor, VendorSchema } from '@schemas/vendor'

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

export type CustomerVendor = typeof CustomerVendorSchema.Type

export const makeCustomerVendor = (customer?: Customer | null, vendor?: Vendor | null): CustomerVendor | null => {
  if (customer) {
    return { ...customer, customerVendorType: 'CUSTOMER' }
  }

  if (vendor) {
    return { ...vendor, customerVendorType: 'VENDOR' }
  }

  return null
}
