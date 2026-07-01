import { pipe, Schema } from 'effect'

export const PaginatedResponseMetaSchema = Schema.Struct({
  cursor: Schema.NullishOr(Schema.String),

  hasMore: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('has_more'),
  ),

  totalCount: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('total_count'),
  ),
})
export type PaginatedResponseMeta = typeof PaginatedResponseMetaSchema.Type

export const PaginatedResponseSchema = <A, I, R>(
  dataSchema: Schema.Schema<A, I, R>,
) =>
  Schema.Struct({
    data: Schema.Array(dataSchema),
    meta: Schema.optional(Schema.Struct({
      pagination: PaginatedResponseMetaSchema,
    })),
  })

export type PaginatedResponse<A> = Schema.Schema.Type<
  ReturnType<typeof PaginatedResponseSchema<A, A, never>>
>
