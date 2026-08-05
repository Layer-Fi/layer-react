import { Schema } from 'effect'

export const UpsertCustomerSchema = Schema.Struct({
  externalId: Schema.optional(Schema.NullOr(Schema.String)).pipe(
    Schema.fromKey('external_id'),
  ),

  individualName: Schema.optional(Schema.NullOr(Schema.String)).pipe(
    Schema.fromKey('individual_name'),
  ),

  companyName: Schema.optional(Schema.NullOr(Schema.String)).pipe(
    Schema.fromKey('company_name'),
  ),

  email: Schema.optional(Schema.NullOr(Schema.String)),

  mobilePhone: Schema.optional(Schema.NullOr(Schema.String)).pipe(
    Schema.fromKey('mobile_phone'),
  ),

  officePhone: Schema.optional(Schema.NullOr(Schema.String)).pipe(
    Schema.fromKey('office_phone'),
  ),

  addressString: Schema.optional(Schema.NullOr(Schema.String)).pipe(
    Schema.fromKey('address_string'),
  ),

  memo: Schema.optional(Schema.NullOr(Schema.String)),
})

export type UpsertCustomer = typeof UpsertCustomerSchema.Type
export type UpsertCustomerEncoded = typeof UpsertCustomerSchema.Encoded
