import { pipe, Schema } from 'effect'

export enum AskFormNextKind {
  Page = 'PAGE',
  Submit = 'SUBMIT',
  Server = 'SERVER',
}

const AskFormNextPageSchema = Schema.Struct({
  kind: Schema.Literal(AskFormNextKind.Page),
  pageId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('page_id'),
  ),
})

const AskFormNextSubmitSchema = Schema.Struct({
  kind: Schema.Literal(AskFormNextKind.Submit),
  review: Schema.optionalWith(Schema.Boolean, { default: () => false, nullable: true }),
})

const AskFormNextServerSchema = Schema.Struct({
  kind: Schema.Literal(AskFormNextKind.Server),
  url: Schema.String,
})

export const AskFormNextSchema = Schema.Union(
  AskFormNextPageSchema,
  AskFormNextSubmitSchema,
  AskFormNextServerSchema,
)

export const AskFormStaticNextSchema = Schema.Union(AskFormNextPageSchema, AskFormNextSubmitSchema)

export type AskFormNext = typeof AskFormNextSchema.Type
export type AskFormNextServer = typeof AskFormNextServerSchema.Type
