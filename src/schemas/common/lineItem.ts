import { Schema, Effect, pipe, ParseResult } from 'effect'

const lineItemFields = {
  name: Schema.String,

  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),

  value: Schema.Number,

  isContra: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_contra'),
  ),

  percentDelta: Schema.optional(Schema.BigDecimal).pipe(
    Schema.fromKey('percent_delta'),
  ),
}

export interface LineItem extends Schema.Struct.Type<typeof lineItemFields> {
  lineItems: ReadonlyArray<LineItem>
}

export interface LineItemEncoded extends Schema.Struct.Encoded<typeof lineItemFields> {
  readonly line_items: ReadonlyArray<LineItemEncoded>
}

export const LineItemSchema = Schema.Struct({
  ...lineItemFields,
  lineItems: pipe(
    Schema.propertySignature(
      Schema.Array(
        Schema.suspend((): Schema.Schema<LineItem, LineItemEncoded> => LineItemSchema),
      ),
    ),
    Schema.fromKey('line_items'),
  ),
})

export type LineItemWithId = Omit<LineItem, 'lineItems'> & { readonly id: string, lineItems: ReadonlyArray<LineItemWithId> }

const addId = (li: LineItem): LineItemWithId => ({
  ...li,
  id: li.name,
  lineItems: li.lineItems.map(addId),
})

export const decodeLineItemWithId = (
  input: unknown,
): Effect.Effect<LineItemWithId, ParseResult.ParseError> =>
  pipe(
    Schema.decodeUnknown(LineItemSchema)(input),
    Effect.map(addId),
  )
