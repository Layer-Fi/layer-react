import { pipe, Schema } from 'effect'

const VendorStatusSchema = Schema.Literal(
  'ACTIVE',
  'ARCHIVED',
)
type VendorStatus = typeof VendorStatusSchema.Type

const TransformedVendorStatusSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(VendorStatusSchema),
  {
    decode: (input) => {
      if (VendorStatusSchema.literals.includes(input as VendorStatus)) {
        return input as VendorStatus
      }

      return 'ACTIVE'
    },
    encode: input => input,
  },
)

export const VendorSchema = Schema.Struct({
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

  status: TransformedVendorStatusSchema,

  memo: Schema.NullOr(Schema.String),

  _local: Schema.Struct({
    isOptimistic: Schema.Boolean,
  }).pipe(Schema.optional),
})

export const encodeVendor = Schema.encodeSync(VendorSchema)
