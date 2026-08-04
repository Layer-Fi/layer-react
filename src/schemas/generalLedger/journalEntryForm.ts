import { Schema } from 'effect'

import { AccountIdentifierSchema } from '@schemas/common/accountIdentifier'
import { NonRecursiveBigDecimalSchema } from '@schemas/common/nonRecursiveBigDecimal'
import { ZonedDateTimeFromSelf } from '@schemas/common/zonedDateTimeFromSelf'
import { CustomerSchema } from '@schemas/customerVendor/customer'
import { VendorSchema } from '@schemas/customerVendor/vendor'
import { LedgerEntryDirectionSchema } from '@schemas/generalLedger/ledgerEntryDirection'
import { TagSchema } from '@schemas/tags/tag'

export const JournalEntryFormLineItemSchema = Schema.Struct({
  externalId: Schema.NullOr(Schema.String),
  accountIdentifier: AccountIdentifierSchema,
  amount: NonRecursiveBigDecimalSchema,
  direction: LedgerEntryDirectionSchema,
  memo: Schema.NullOr(Schema.String),
  tags: Schema.Array(TagSchema),

  customer: Schema.NullOr(CustomerSchema),
  vendor: Schema.NullOr(VendorSchema),
})

export const JournalEntryFormSchema = Schema.Struct({
  externalId: Schema.NullOr(Schema.String),
  entryAt: ZonedDateTimeFromSelf,
  createdBy: Schema.String,
  memo: Schema.String,
  tags: Schema.Array(TagSchema),
  metadata: Schema.NullOr(Schema.Unknown),
  referenceNumber: Schema.NullOr(Schema.String),
  lineItems: Schema.Array(JournalEntryFormLineItemSchema),

  customer: Schema.NullOr(CustomerSchema),
  vendor: Schema.NullOr(VendorSchema),
})

export type JournalEntryFormLineItem = typeof JournalEntryFormLineItemSchema.Type
export type JournalEntryForm = Omit<typeof JournalEntryFormSchema.Type, 'lineItems'> & {
  // Purposefully allow lineItems to be mutable for `field.pushValue` in the form
  lineItems: JournalEntryFormLineItem[]
}
