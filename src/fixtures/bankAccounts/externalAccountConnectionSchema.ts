import { Schema } from 'effect'

import { ExternalAccountConnectionSchema } from '@schemas/bankAccounts/externalAccountConnection'

import { accountNameKinds, institutions } from '@fixtures/bankAccounts/constants'
import { maskArbitrary } from '@fixtures/utils/arbitrary/mask'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

const fields = ExternalAccountConnectionSchema.fields

export const externalAccountConnectionSchema = Schema.Struct({
  ...fields,
  externalAccountSource: withArbitrary(fields.externalAccountSource, () => fc =>
    fc.constant('PLAID')),
  externalAccountName: withArbitrary(fields.externalAccountName, () => fc =>
    fc.constantFrom(...accountNameKinds)),
  mask: withArbitrary(fields.mask, () => maskArbitrary),
  institution: withArbitrary(fields.institution, () => fc =>
    fc.constantFrom(...institutions)),
  notifications: withArbitrary(fields.notifications, () => fc =>
    fc.constant([])),
  connectionNeedsRepairAsOf: withArbitrary(fields.connectionNeedsRepairAsOf, () => fc =>
    fc.constant(null)),
  reconnectWithNewCredentials: withArbitrary(fields.reconnectWithNewCredentials, () => fc =>
    fc.boolean()),
  connectionExternalId: withArbitrary(fields.connectionExternalId, () => fc =>
    fc.constant(null)),
  userCreated: withArbitrary(fields.userCreated, () => fc =>
    fc.boolean()),
  isSyncing: withArbitrary(fields.isSyncing, () => fc =>
    fc.boolean()),
})
