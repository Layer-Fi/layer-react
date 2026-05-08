# Schema conventions

We use Effect's `Schema` for API types. Most structs are just `Schema.Struct({...})`. The only non-obvious case is **recursive schemas** (trees: nested columns/rows/breakdowns).

## Recursive schemas

Reference: `src/schemas/reports/unifiedReport.ts`.

1. **Extract non-recursive fields** into a const bag.
2. **Declare paired `interface`s** for the decoded `Type` and the encoded wire shape, each extending `Schema.Struct.{Type,Encoded}<typeof fields>` and adding the recursive `ReadonlyArray` by hand. Must be `interface`, not `type` — only interfaces can self-reference.
3. **Wrap the recursive arm in `Schema.suspend`** with an explicit return-type annotation tying the two interfaces back to the schema.

```ts
const unifiedReportColumnFields = {
  columnKey: pipe(Schema.propertySignature(Schema.String), Schema.fromKey('column_key')),
  displayName: pipe(Schema.propertySignature(Schema.String), Schema.fromKey('display_name')),
}

export interface UnifiedReportColumn extends Schema.Struct.Type<typeof unifiedReportColumnFields> {
  columns?: ReadonlyArray<UnifiedReportColumn>
}
export interface UnifiedReportColumnEncoded extends Schema.Struct.Encoded<typeof unifiedReportColumnFields> {
  readonly columns?: ReadonlyArray<UnifiedReportColumnEncoded>
}

export const UnifiedReportColumnSchema = Schema.Struct({
  ...unifiedReportColumnFields,
  columns: Schema.optional(
    Schema.Array(
      Schema.suspend((): Schema.Schema<UnifiedReportColumn, UnifiedReportColumnEncoded> => UnifiedReportColumnSchema),
    ),
  ),
})
```

The naive `columns: Schema.Array(UnifiedReportColumnSchema)` fails — the schema isn't defined yet when the expression evaluates. `Schema.suspend` defers it; the interface pair gives you working recursive TS types.
