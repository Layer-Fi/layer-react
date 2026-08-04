import { pipe, Schema } from 'effect'

import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const ClosingActionLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Closing_Action_Ledger_Entry_Source'),
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
  }),
)
