import { Schema, pipe } from 'effect'
import { LineItemSchema } from '../common/lineItem'

export enum ReportEnum {
  BalanceSheet = 'balance-sheet',
}

export const UnifiedReportSchema = Schema.Struct({
  businessId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('business_id'),
  ),
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(LineItemSchema)),
    Schema.fromKey('line_items'),
  ),
})

export type UnifiedReport = typeof UnifiedReportSchema.Type
