import { Schema } from 'effect'

export const CustomerFormSchema = Schema.Struct({
  individualName: Schema.String,
  companyName: Schema.String,
  email: Schema.String,
  addressString: Schema.String,
})

export type CustomerForm = typeof CustomerFormSchema.Type
