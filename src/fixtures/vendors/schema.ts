import { Arbitrary, Schema } from 'effect'

import { VendorSchema } from '@schemas/vendor'

import {
  applyContactInvariants,
  companyNameArbitrary,
  contactStatusArbitrary,
  externalIdArbitrary,
  generatedEmailArbitrary,
  individualNameArbitrary,
  memoArbitrary,
} from '@fixtures/utils/contactFields'
import { phoneNumberArbitrary } from '@fixtures/utils/phoneNumberArbitrary'
import { withArbitrary } from '@fixtures/utils/withArbitrary'

// `_local` is client-only optimistic-update state, never present on a server
// response, so it's excluded from the wire-format fixtures entirely.
const { _local, ...fields } = VendorSchema.fields

const base = Schema.Struct({
  ...fields,
  externalId: withArbitrary(fields.externalId, () => externalIdArbitrary),
  individualName: withArbitrary(fields.individualName, () => individualNameArbitrary),
  companyName: withArbitrary(fields.companyName, () => companyNameArbitrary),
  email: withArbitrary(fields.email, () => generatedEmailArbitrary),
  mobilePhone: withArbitrary(fields.mobilePhone, () => phoneNumberArbitrary),
  officePhone: withArbitrary(fields.officePhone, () => phoneNumberArbitrary),
  status: withArbitrary(fields.status, () => contactStatusArbitrary),
  memo: withArbitrary(fields.memo, () => memoArbitrary([
    'Preferred supplier',
    'Net 30 terms',
    'Requires PO number',
  ])),
})

const baseArbitrary = Arbitrary.make(base)

export const VendorArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((vendor): typeof base.Type => applyContactInvariants(vendor)),
})

export const schema = VendorArbitrarySchema
