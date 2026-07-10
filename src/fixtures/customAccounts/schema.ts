import { Arbitrary, Schema } from 'effect'

import {
  CustomAccountSchema,
  type CustomAccountSubtype,
  getCustomAccountTypeFromSubtype,
} from '@schemas/customAccounts'

import {
  accountNameArbitrary,
  accountSubtypeArbitrary,
  institutionNameArbitrary,
  isoTimestampArbitrary,
} from '@fixtures/customAccounts/arbitrary'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { maskArbitrary } from '@fixtures/utils/arbitrary/mask'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

const fields = CustomAccountSchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.customAccount)),
  externalId: withArbitrary(fields.externalId, () => fc => fc.constant(null)),
  mask: withArbitrary(fields.mask, () => maskArbitrary),
  accountName: withArbitrary(fields.accountName, () => accountNameArbitrary),
  institutionName: withArbitrary(fields.institutionName, () => institutionNameArbitrary),
  accountSubtype: withArbitrary(fields.accountSubtype, () => accountSubtypeArbitrary),
  createdAt: withArbitrary(fields.createdAt, () => isoTimestampArbitrary),
  updatedAt: withArbitrary(fields.updatedAt, () => isoTimestampArbitrary),
  archivedAt: withArbitrary(fields.archivedAt, () => fc => fc.constant(null)),
})

const baseArbitrary = Arbitrary.make(base)

export const CustomAccountArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((account): typeof base.Type => {
      // Timestamps are sampled independently; order them so a row never updates
      // before it was created. ISO-8601 UTC strings sort chronologically.
      const [createdAt, updatedAt] = [account.createdAt, account.updatedAt].sort()

      return {
        ...account,
        createdAt,
        updatedAt,
        accountType: getCustomAccountTypeFromSubtype(
          account.accountSubtype as CustomAccountSubtype,
        ),
      }
    }),
})

export const schema = CustomAccountArbitrarySchema
