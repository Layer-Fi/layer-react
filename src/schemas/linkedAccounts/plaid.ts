import { pipe, Schema } from 'effect'

import type { Awaitable } from '@internal-types/utility/promises'
import { createTransformedEnumSchema } from '@schemas/utils'

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

export enum PlaidHostedLinkState {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  EXITED = 'EXITED',
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN',
}

const PlaidHostedLinkStateEnumSchema = Schema.Enums(PlaidHostedLinkState)

export const TransformedPlaidHostedLinkStateSchema = createTransformedEnumSchema(
  PlaidHostedLinkStateEnumSchema,
  PlaidHostedLinkState,
  PlaidHostedLinkState.UNKNOWN,
)

export const ApiPlaidHostedLinkStatusSchema = Schema.Struct({
  state: TransformedPlaidHostedLinkStateSchema,
})

export type ApiPlaidHostedLinkStatus = typeof ApiPlaidHostedLinkStatusSchema.Type

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
