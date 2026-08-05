import { Schema } from 'effect'

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
