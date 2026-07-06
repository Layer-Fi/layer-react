import { Arbitrary, type FastCheck, Schema } from 'effect'

import { CustomerSchema } from '@schemas/customer'

import { withArbitrary } from '@fixtures/utils/withArbitrary'

const nullableConstantFrom = (values: readonly string[]) => (fc: typeof FastCheck) =>
  fc.oneof(
    fc.constant(null),
    fc.constantFrom(...values),
  )

// `_local` is client-only optimistic-update state, never present on a server
// response, so it's excluded from the wire-format fixtures entirely.
const { _local, ...fields } = CustomerSchema.fields

const base = Schema.Struct({
  ...fields,
  externalId: withArbitrary(fields.externalId, () => fc =>
    fc.oneof(
      fc.constant(null),
      fc.integer({ min: 10000, max: 99999 }).map(n => `ext_${n}`),
    )),
  individualName: withArbitrary(fields.individualName, () => nullableConstantFrom([
    'Jane Doe',
    'John Smith',
    'Maria Garcia',
    'Wei Chen',
    'Amara Okafor',
  ])),
  companyName: withArbitrary(fields.companyName, () => nullableConstantFrom([
    'Acme Corp',
    'Globex LLC',
    'Initech',
    'Umbrella Holdings',
    'Stark Industries',
  ])),
  email: withArbitrary(fields.email, () => fc =>
    fc.oneof(
      fc.constant(null),
      fc.tuple(
        fc.constantFrom('jane', 'john', 'maria', 'wei', 'amara', 'contact', 'billing'),
        fc.constantFrom('example.com', 'acme.test', 'globex.test'),
      ).map(([user, domain]) => `${user}@${domain}`),
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
  addressString: withArbitrary(fields.addressString, () => fc =>
    fc.oneof(
      fc.constant(null),
      fc.constantFrom(
        '123 Main St, Springfield, IL 62701',
        '456 Market St, San Francisco, CA 94105',
        '789 Broadway, New York, NY 10003',
        '12 Elm St, Austin, TX 78701',
      ),
    )),
  status: withArbitrary(fields.status, () => fc =>
    fc.constantFrom('ACTIVE', 'ARCHIVED')),
  memo: withArbitrary(fields.memo, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(null), weight: 4 },
      { arbitrary: fc.constantFrom('VIP client', 'Follow up next quarter', 'Referred by partner'), weight: 1 },
    )),
})

const baseArbitrary = Arbitrary.make(base)

export const CustomerArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((customer): typeof base.Type => {
      // A customer must have at least one of individualName/companyName set,
      // mirroring validateCustomerForm's "either" requirement.
      if (customer.individualName == null && customer.companyName == null) {
        return { ...customer, individualName: 'Jane Doe' }
      }

      return customer
    }),
})

export const schema = CustomerArbitrarySchema
