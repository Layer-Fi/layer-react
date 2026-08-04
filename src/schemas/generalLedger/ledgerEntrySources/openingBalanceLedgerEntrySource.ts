import { pipe, Schema } from 'effect'
export const OpeningBalanceLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Opening_Balance_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  accountName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('account_name'),
  ),
  openingBalanceId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('opening_balance_id'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})
