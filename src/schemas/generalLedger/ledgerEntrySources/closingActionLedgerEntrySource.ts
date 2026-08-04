import { pipe, Schema } from 'effect'
export const ClosingActionLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Closing_Action_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  closingActionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('closing_action_id'),
  ),
  actionType: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('action_type'),
  ),
  closingDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('closing_date'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})
