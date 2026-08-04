import { pipe, Schema } from 'effect'

import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const PayrollPaymentLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Payroll_Payment_Ledger_Entry_Source'),
    payrollId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('payroll_id'),
    ),
    amount: Schema.Number,
  }),
)
