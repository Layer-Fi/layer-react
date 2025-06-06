import { Schema, pipe } from 'effect'

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

  status: TransformedCustomerStatusSchema,

  memo: Schema.NullOr(Schema.String),
})
