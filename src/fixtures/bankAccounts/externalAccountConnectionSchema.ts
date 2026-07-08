import { type FastCheck, Schema } from 'effect'

import { ExternalAccountConnectionSchema } from '@schemas/bankAccounts/externalAccountConnection'

import { accountNameKinds, institutions } from '@fixtures/bankAccounts/constants'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

const maskArbitrary = (fc: typeof FastCheck) =>
  fc.integer({ min: 0, max: 9999 }).map(n => String(n).padStart(4, '0'))

const fields = ExternalAccountConnectionSchema.fields

export const externalAccountConnectionSchema = Schema.Struct({
  ...fields,
  externalAccountSource: withArbitrary(fields.externalAccountSource, () => fc =>
    fc.constant('PLAID')),
  externalAccountName: withArbitrary(fields.externalAccountName, () => fc =>
    fc.constantFrom(...accountNameKinds)),
  mask: withArbitrary(fields.mask, () => fc =>
    fc.option(maskArbitrary(fc), { nil: null })),
  institution: withArbitrary(fields.institution, () => fc =>
    fc.option(fc.constantFrom(...institutions), { nil: null })),
  notifications: withArbitrary(fields.notifications, () => fc =>
    fc.constant([])),
  connectionNeedsRepairAsOf: withArbitrary(fields.connectionNeedsRepairAsOf, () => fc =>
    fc.constant(null)),
  reconnectWithNewCredentials: withArbitrary(fields.reconnectWithNewCredentials, () => fc =>
    fc.boolean()),
  connectionExternalId: withArbitrary(fields.connectionExternalId, () => fc =>
    fc.option(
      fc.integer({ min: 100000, max: 999999 }).map(n => `connection_${n}`),
      { nil: null },
    )),
  userCreated: withArbitrary(fields.userCreated, () => fc =>
    fc.boolean()),
  isSyncing: withArbitrary(fields.isSyncing, () => fc =>
    fc.boolean()),
})
