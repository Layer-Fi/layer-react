import { Arbitrary, type FastCheck, Schema } from 'effect'

import { VendorSchema } from '@schemas/vendor'

import { companyNames } from '@fixtures/constants/personal/companyNames'
import { individualNames } from '@fixtures/constants/personal/individualNames'
import { emailForName } from '@fixtures/utils/emailForName'
import { withArbitrary } from '@fixtures/utils/withArbitrary'

const nullableConstantFrom = (values: readonly string[]) => (fc: typeof FastCheck) =>
  fc.oneof(
    fc.constant(null),
    fc.constantFrom(...values),
  )

const GENERATED_EMAIL = 'GENERATE'

// `_local` is client-only optimistic-update state, never present on a server
// response, so it's excluded from the wire-format fixtures entirely.
const { _local, ...fields } = VendorSchema.fields

const base = Schema.Struct({
  ...fields,
  externalId: withArbitrary(fields.externalId, () => fc =>
    fc.oneof(
      fc.constant(null),
      fc.integer({ min: 10000, max: 99999 }).map(n => `ext_${n}`),
    )),
  individualName: withArbitrary(fields.individualName, () => nullableConstantFrom(individualNames)),
  companyName: withArbitrary(fields.companyName, () => nullableConstantFrom(companyNames)),
  email: withArbitrary(fields.email, () => fc =>
    fc.oneof(
      fc.constant(null),
      fc.constant(GENERATED_EMAIL),
    )),
  mobilePhone: withArbitrary(fields.mobilePhone, () => fc =>
    fc.oneof(
      fc.constant(null),
      fc.integer({ min: 2000000000, max: 9999999999 }).map(n => `+1${n}`),
    )),
  officePhone: withArbitrary(fields.officePhone, () => fc =>
    fc.oneof(
      fc.constant(null),
      fc.integer({ min: 2000000000, max: 9999999999 }).map(n => `+1${n}`),
    )),
  status: withArbitrary(fields.status, () => fc =>
    fc.constantFrom('ACTIVE', 'ARCHIVED')),
  memo: withArbitrary(fields.memo, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(null), weight: 4 },
      {
        arbitrary: fc.constantFrom(
          'Preferred supplier',
          'Net 30 terms',
          'Requires PO number',
        ),
        weight: 1,
      },
    )),
})

const baseArbitrary = Arbitrary.make(base)

export const VendorArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((vendor): typeof base.Type => {
      // A vendor must have at least one of individualName/companyName set,
      // mirroring the same rule enforced for customers (identical shape).
      const individualName = vendor.individualName == null && vendor.companyName == null
        ? 'Jane Doe'
        : vendor.individualName

      const email = vendor.email === GENERATED_EMAIL
        ? emailForName(individualName, vendor.companyName)
        : vendor.email

      return { ...vendor, individualName, email }
    }),
})

export const schema = VendorArbitrarySchema
