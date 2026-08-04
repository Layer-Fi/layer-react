import { pipe, Schema } from 'effect'

export const ApiLinkTokenSchema = Schema.Struct({
  type: Schema.Literal('Link_Token'),

  linkToken: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('link_token'),
  ),

  hostedLink: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('hosted_link'),
  ),
})

export type ApiLinkToken = typeof ApiLinkTokenSchema.Type
