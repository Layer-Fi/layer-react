import { CustomerSchema } from '../customers/customersSchemas'
import { VendorSchema } from '../vendors/vendorsSchemas'
import { Schema } from 'effect'

export const SecondPartyTypeSchema = Schema.Literal('CUSTOMER', 'VENDOR')

const DiscriminatedCustomerSchema = Schema.Struct({
  ...CustomerSchema.fields,
  secondPartyType: SecondPartyTypeSchema.pipe(
    Schema.pickLiteral('CUSTOMER'),
  ),
})

const DiscriminatedVendorSchema = Schema.Struct({
  ...VendorSchema.fields,
  secondPartyType: SecondPartyTypeSchema.pipe(
    Schema.pickLiteral('VENDOR'),
  ),
})

export const SecondPartySchema = Schema.Union(
  DiscriminatedCustomerSchema,
  DiscriminatedVendorSchema,
)

export const decodeSecondParty = Schema.decodeSync(SecondPartySchema)
