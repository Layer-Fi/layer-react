import { Arbitrary, Schema } from 'effect'

import { VendorSchema } from '@schemas/vendor'

import { vendorMemos } from '@fixtures/constants/personal/vendorMemos'
import {
  applyContactInvariants,
  companyNameArbitrary,
  contactStatusArbitrary,
  generatedEmailArbitrary,
  individualNameArbitrary,
  memoArbitrary,
  phoneNumberArbitrary,
} from '@fixtures/utils/contactFields'
import { externalIdArbitrary } from '@fixtures/utils/externalIdArbitrary'
import { withArbitrary } from '@fixtures/utils/withArbitrary'

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
  memo: withArbitrary(fields.memo, () => memoArbitrary(vendorMemos)),
})

const baseArbitrary = Arbitrary.make(base)

export const VendorArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((vendor): typeof base.Type => applyContactInvariants(vendor)),
})

export const schema = VendorArbitrarySchema
