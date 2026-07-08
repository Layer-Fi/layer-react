import { type FastCheck } from 'effect'

import { CustomAccountSubtype } from '@schemas/customAccounts'

import { accountNames } from '@fixtures/constants/bank/accountNames'
import { institutionNames } from '@fixtures/constants/bank/institutionNames'

export const isoTimestampArbitrary = (fc: typeof FastCheck) =>
  fc
    .date({
      min: new Date('2020-01-01T00:00:00Z'),
      max: new Date('2025-12-31T23:59:59Z'),
      noInvalidDate: true,
    })
    .map(date => date.toISOString())

export const accountNameArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom(...accountNames)

export const institutionNameArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom(...institutionNames)

export const accountSubtypeArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom(...Object.values(CustomAccountSubtype))

export const archivedAtArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant(null), weight: 9 },
    { arbitrary: isoTimestampArbitrary(fc), weight: 1 },
  )
