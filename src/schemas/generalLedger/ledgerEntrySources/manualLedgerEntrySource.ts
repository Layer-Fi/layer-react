import { pipe, Schema } from 'effect'

import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const ManualLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Manual_Ledger_Entry_Source'),
    manualEntryId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('manual_entry_id'),
    ),
    createdBy: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('created_by'),
    ),
  }),
)
