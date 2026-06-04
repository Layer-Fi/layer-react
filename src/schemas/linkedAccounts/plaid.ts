import { pipe, Schema } from 'effect'

export const HostedLinkParamsSchema = Schema.Struct({
  completionRedirectUri: Schema.optional(Schema.String).pipe(
    Schema.fromKey('completion_redirect_uri'),
  ),

  isMobileApp: Schema.optional(Schema.Boolean).pipe(
    Schema.fromKey('is_mobile_app'),
  ),
})

export type HostedLinkParams = typeof HostedLinkParamsSchema.Type
export type HostedLinkParamsEncoded = typeof HostedLinkParamsSchema.Encoded

export const CreatePlaidLinkParamsSchema = Schema.Struct({
  redirectUri: Schema.optional(Schema.String).pipe(
    Schema.fromKey('redirect_uri'),
  ),

  hostedLinkParams: Schema.optional(HostedLinkParamsSchema).pipe(
    Schema.fromKey('hosted_link_params'),
  ),
})

export type CreatePlaidLinkParams = typeof CreatePlaidLinkParamsSchema.Type
export type CreatePlaidLinkParamsEncoded = typeof CreatePlaidLinkParamsSchema.Encoded

export const encodeCreatePlaidLinkParams = Schema.encodeSync(CreatePlaidLinkParamsSchema)

export const ApiLinkTokenSchema = Schema.Struct({
  type: Schema.Literal('Link_Token'),

  linkToken: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('link_token'),
  ),

  hostedLink: Schema.optional(Schema.NullOr(Schema.String)).pipe(
    Schema.fromKey('hosted_link'),
  ),
})

export type ApiLinkToken = typeof ApiLinkTokenSchema.Type
