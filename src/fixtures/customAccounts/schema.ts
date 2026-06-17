import { type FastCheck, Schema } from 'effect'

import {
  CustomAccountSchema,
  CustomAccountSubtype,
  CustomAccountType,
} from '@schemas/customAccounts'

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

const CustomAccountArbitrarySchema = Schema.Struct({
  ...fields,
  externalId: withArbitrary(fields.externalId, () => fc =>
    fc.oneof(
      fc.constant(null),
      fc.integer({ min: 10000, max: 99999 }).map(n => `ext_${n}`),
    )),
  mask: withArbitrary(fields.mask, () => fc =>
    fc.integer({ min: 0, max: 9999 }).map(n => String(n).padStart(4, '0'))),
  accountName: withArbitrary(fields.accountName, () => fc =>
    fc.constantFrom(
      'Primary Checking',
      'Business Checking',
      'Operating Account',
      'Savings',
      'Business Credit Card',
      'Reserve Account',
    )),
  institutionName: withArbitrary(fields.institutionName, () => fc =>
    fc.constantFrom(
      'Chase',
      'Bank of America',
      'Wells Fargo',
      'Citibank',
      'Capital One',
      'American Express',
    )),
  accountType: withArbitrary(fields.accountType, () => fc =>
    fc.constantFrom(...Object.values(CustomAccountType))),
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

export const schema = CustomAccountArbitrarySchema
