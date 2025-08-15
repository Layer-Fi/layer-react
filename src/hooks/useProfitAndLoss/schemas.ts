import { Schema, pipe } from 'effect'
import { Direction } from '../../types'
import {
  LedgerEntrySourceSchema,
  AccountSchema,
} from '../../schemas/ledgerEntrySourceSchemas'

export const TagFilterSchema = Schema.Struct({
  key: Schema.String,
  values: Schema.Array(Schema.String),
})

export const PnlDetailLineSchema = Schema.Struct({
  id: Schema.String,
  entryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entry_id'),
  ),
  account: AccountSchema,
  amount: Schema.Number,
  direction: Schema.Enums(Direction),
  date: Schema.String,
  source: Schema.optional(LedgerEntrySourceSchema),
})

export const PnlDetailLinesDataSchema = Schema.Struct({
  type: Schema.String,
  businessId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('business_id'),
  ),
  startDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('start_date'),
  ),
  endDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('end_date'),
  ),
  pnlStructureLineItemName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('pnl_structure_line_item_name'),
  ),
  reportingBasis: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reporting_basis'),
  ),
  pnlStructure: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('pnl_structure'),
  ),
  tagFilter: pipe(
    Schema.propertySignature(Schema.NullOr(TagFilterSchema)),
    Schema.fromKey('tag_filter'),
  ),
  lines: Schema.Array(PnlDetailLineSchema),
})
