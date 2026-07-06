import { Arbitrary, type FastCheck, Schema } from 'effect'

import {
  CustomAccountSchema,
  CustomAccountSubtype,
  getCustomAccountTypeFromSubtype,
} from '@schemas/customAccounts'

import { accountNames } from '@fixtures/constants/bank/accountNames'
import { institutionNames } from '@fixtures/constants/bank/institutionNames'
import { externalIdArbitrary } from '@fixtures/utils/externalIdArbitrary'
import { withArbitrary } from '@fixtures/utils/withArbitrary'

const isoTimestampArbitrary = (fc: typeof FastCheck) =>
  fc
    .date({
      min: new Date('2020-01-01T00:00:00Z'),
      max: new Date('2025-12-31T23:59:59Z'),
      noInvalidDate: true,
    })
    .map(date => date.toISOString())

const fields = CustomAccountSchema.fields

const base = Schema.Struct({
  ...fields,
  externalId: withArbitrary(fields.externalId, () => externalIdArbitrary),
  mask: withArbitrary(fields.mask, () => fc =>
    fc.integer({ min: 0, max: 9999 }).map(n => String(n).padStart(4, '0'))),
  accountName: withArbitrary(fields.accountName, () => fc =>
    fc.constantFrom(...accountNames)),
  institutionName: withArbitrary(fields.institutionName, () => fc =>
    fc.constantFrom(...institutionNames)),
  accountSubtype: withArbitrary(fields.accountSubtype, () => fc =>
    fc.constantFrom(...Object.values(CustomAccountSubtype))),
  createdAt: withArbitrary(fields.createdAt, () => isoTimestampArbitrary),
  updatedAt: withArbitrary(fields.updatedAt, () => isoTimestampArbitrary),
  archivedAt: withArbitrary(fields.archivedAt, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(null), weight: 9 },
      { arbitrary: isoTimestampArbitrary(fc), weight: 1 },
    )),
})

const baseArbitrary = Arbitrary.make(base)

export const CustomAccountArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((account): typeof base.Type => {
      // Timestamps are sampled independently; order them so a row never updates
      // before it was created, nor archives before its last update. ISO-8601 UTC
      // strings sort chronologically, so a plain sort suffices.
      const [createdAt, updatedAt] = [account.createdAt, account.updatedAt].sort()
      const archivedAt =
        account.archivedAt == null
          ? account.archivedAt
          : [updatedAt, account.archivedAt].sort().at(-1)

      return {
        ...account,
        createdAt,
        updatedAt,
        archivedAt,
        accountType: getCustomAccountTypeFromSubtype(
          account.accountSubtype as CustomAccountSubtype,
        ),
      }
    }),
})

export const schema = CustomAccountArbitrarySchema
