import { Schema } from 'effect'

import { createTransformedEnumSchema } from '@schemas/common/utils'

export enum PlaidHostedLinkState {
  NOT_STARTED = 'NOT_STARTED',
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
