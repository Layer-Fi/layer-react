import { pipe, Schema } from 'effect'

import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const QuickBooksLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Quickbooks_Ledger_Entry_Source'),
    quickbooksId: pipe(
      Schema.optional(Schema.NullOr(Schema.String)),
      Schema.fromKey('quickbooks_id'),
    ),
    importDate: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('import_date'),
    ),
  }),
)
