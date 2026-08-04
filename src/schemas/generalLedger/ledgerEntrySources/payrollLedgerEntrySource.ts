import { pipe, Schema } from 'effect'

import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const PayrollLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Payroll_Ledger_Entry_Source'),
    payrollId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('payroll_id'),
    ),
    payday: Schema.String,
  }),
)
