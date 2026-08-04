import { Schema } from 'effect'

import type { Awaitable } from '@internal-types/utility/promises'
import { type CreatePlaidLinkParams, CreatePlaidLinkParamsSchema } from '@schemas/linkedAccounts/createPlaidLinkParams'

/**
 * Public configuration for the Plaid Hosted Link flow, accepted as a prop by
 * exported components that allow linking accounts.
 *
 * When `isMobileApp` is `true`, both `redirectUri` and `completionRedirectUri`
 * are required so the hosted flow can return the user to the app. Otherwise all
 * fields are optional. Modelled as a union so the type system enforces the
 * mobile-app requirements.
 */
export const PlaidHostedLinkConfigSchema = Schema.Union(
  Schema.Struct({
    isMobileApp: Schema.Literal(true),
    redirectUri: Schema.String,
    completionRedirectUri: Schema.String,
  }),
  Schema.Struct({
    isMobileApp: Schema.optional(Schema.Literal(false)),
    redirectUri: Schema.optional(Schema.String),
    completionRedirectUri: Schema.optional(Schema.String),
  }),
)

export type PlaidHostedLinkParams = typeof PlaidHostedLinkConfigSchema.Type

export type PlaidHostedLinkConfig = PlaidHostedLinkParams & {
  /**
   * Navigates the customer platform to the Plaid Hosted Link URL, returning via
   * `completionRedirectUri`. The return must reload the page: status is polled
   * only while mounted, so the remount is what signals the user came back and
   * restarts polling. Without it, a completed or failed link may go undetected.
   */
  navigateToHostedLink: (hostedLinkUrl: string) => Awaitable<void>
}

const CreatePlaidLinkParamsFromHostedLinkConfigSchema = Schema.transform(
  PlaidHostedLinkConfigSchema,
  Schema.typeSchema(CreatePlaidLinkParamsSchema),
  {
    strict: false,
    decode: ({ isMobileApp, redirectUri, completionRedirectUri }) => ({
      redirectUri,
      hostedLinkParams: { isMobileApp, completionRedirectUri },
    }),
    encode: ({ redirectUri, hostedLinkParams }) => ({
      isMobileApp: hostedLinkParams?.isMobileApp,
      redirectUri,
      completionRedirectUri: hostedLinkParams?.completionRedirectUri,
    }),
  },
)

const decodeCreatePlaidLinkParamsFromHostedLinkConfig = Schema.decodeSync(
  CreatePlaidLinkParamsFromHostedLinkConfigSchema,
)

export function toCreatePlaidLinkParams(config?: PlaidHostedLinkConfig): CreatePlaidLinkParams {
  return config ? decodeCreatePlaidLinkParamsFromHostedLinkConfig(config) : {}
}
