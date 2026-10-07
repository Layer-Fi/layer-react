import { Schema } from 'effect'

export const UnifiedSearchResultSchema = Schema.Struct({
  /** Prefixed by entity (`acct_`, `vend_`, `cust_`) so it can't collide with an option value. */
  id: Schema.String,
  entity: Schema.String,
  label: Schema.String,
  sublabel: Schema.NullishOr(Schema.String),
})

export type UnifiedSearchResult = typeof UnifiedSearchResultSchema.Type

export const UnifiedSearchResultsSchema = Schema.Struct({
  results: Schema.Array(UnifiedSearchResultSchema),
})
