import { pipe, Schema } from 'effect'

import { type LoggedProp, PropKind } from '@internal-types/shared/componentUsage'
import { UnwrappedDataResponseSchema } from '@schemas/common/utils'

export const LoggedPropSchema: Schema.Schema<LoggedProp, {
  readonly name: string
  readonly kind: PropKind
  readonly boolean_value?: boolean | undefined
  readonly keys?: ReadonlyArray<string> | undefined
}> = Schema.Struct({
  name: Schema.String,
  kind: Schema.Literal(
    PropKind.Array,
    PropKind.Boolean,
    PropKind.Function,
    PropKind.Node,
    PropKind.Null,
    PropKind.Number,
    PropKind.Object,
    PropKind.String,
  ),

  booleanValue: pipe(
    Schema.optional(Schema.Boolean),
    Schema.fromKey('boolean_value'),
  ),

  keys: Schema.optional(Schema.Array(Schema.String)),
})

export const ComponentUsageBodySchema = Schema.Struct({
  component: Schema.String,

  /** The nearest enclosing tracked component. `null` means the consumer mounted this directly. */
  parentComponent: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('parent_component'),
  ),

  environment: Schema.optional(Schema.String),

  props: Schema.Array(LoggedPropSchema),
})

export const encodeComponentUsageBody = Schema.encodeSync(ComponentUsageBodySchema)
export type ComponentUsageBody = typeof ComponentUsageBodySchema.Type
export type ComponentUsageBodyEncoded = typeof ComponentUsageBodySchema.Encoded

/**
 * The endpoint answers with the share of this business's usage reports it wants. Customers differ in
 * user count by orders of magnitude, so the backend — which can see the volume — sets the rate, and
 * the client honours it without needing a release. Absent means "send everything".
 */
export const ComponentUsageAckSchema = UnwrappedDataResponseSchema(
  Schema.Struct({
    sampleRate: pipe(
      Schema.optional(Schema.NullishOr(Schema.Number)),
      Schema.fromKey('sample_rate'),
    ),
  }),
)

export type ComponentUsageAck = typeof ComponentUsageAckSchema.Type
