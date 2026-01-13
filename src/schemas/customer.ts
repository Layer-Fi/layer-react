import { pipe, Schema } from 'effect'

const CustomerStatusSchema = Schema.Literal(
  'ACTIVE',
  'ARCHIVED',
)
type CustomerStatus = typeof CustomerStatusSchema.Type

const TransformedCustomerStatusSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(CustomerStatusSchema),
  {
    decode: (input) => {
      if (CustomerStatusSchema.literals.includes(input as CustomerStatus)) {
        return input as CustomerStatus
      }

      return 'ACTIVE'
    },
    encode: input => input,
  },
)

export const CustomerSchema = Schema.Struct({
  id: Schema.UUID,

  externalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),

  individualName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('individual_name'),
  ),

  companyName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('company_name'),
  ),

  email: Schema.NullOr(Schema.String),

  mobilePhone: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('mobile_phone'),
  ),

  officePhone: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('office_phone'),
  ),

  addressString: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('address_string'),
  ),

  status: TransformedCustomerStatusSchema,

  memo: Schema.NullOr(Schema.String),

  _local: Schema.Struct({
    isOptimistic: Schema.Boolean,
  }).pipe(Schema.optional),
})
export type Customer = typeof CustomerSchema.Type

export const encodeCustomer = Schema.encodeSync(CustomerSchema)

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

export const CustomerFormSchema = Schema.Struct({
  individualName: Schema.String,
  companyName: Schema.String,
  email: Schema.String,
  addressString: Schema.String,
})

export type CustomerForm = typeof CustomerFormSchema.Type
