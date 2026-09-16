import { Schema } from 'effect'

import { HostedLinkParamsSchema } from '@schemas/features/linkedAccounts/hostedLinkParams'

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
