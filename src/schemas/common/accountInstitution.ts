import { Schema } from 'effect'

export const AccountInstitutionSchema = Schema.Struct({
  name: Schema.String,
  logo: Schema.NullishOr(Schema.String),
})
export type AccountInstitution = typeof AccountInstitutionSchema.Type
