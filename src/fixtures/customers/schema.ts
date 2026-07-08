import { Arbitrary, Schema } from 'effect'

import { CustomerSchema } from '@schemas/customer'

import { addresses } from '@fixtures/constants/personal/addresses'
import { customerMemos } from '@fixtures/customers/constants'
import {
  applyContactInvariants,
  companyNameArbitrary,
  contactStatusArbitrary,
  generatedEmailArbitrary,
  individualNameArbitrary,
  memoArbitrary,
  phoneNumberArbitrary,
} from '@fixtures/utils/arbitrary/contactFields'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { nullableConstantFrom } from '@fixtures/utils/arbitrary/nullableConstantFrom'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

const { _local, ...fields } = CustomerSchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.customer)),
  externalId: withArbitrary(fields.externalId, () => fc => fc.constant(null)),
  individualName: withArbitrary(fields.individualName, () => individualNameArbitrary),
  companyName: withArbitrary(fields.companyName, () => companyNameArbitrary),
  email: withArbitrary(fields.email, () => generatedEmailArbitrary),
  mobilePhone: withArbitrary(fields.mobilePhone, () => phoneNumberArbitrary),
  officePhone: withArbitrary(fields.officePhone, () => phoneNumberArbitrary),
  addressString: withArbitrary(fields.addressString, () => nullableConstantFrom(addresses)),
  status: withArbitrary(fields.status, () => contactStatusArbitrary),
  memo: withArbitrary(fields.memo, () => memoArbitrary(customerMemos)),
})

const baseArbitrary = Arbitrary.make(base)

export const CustomerArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((customer): typeof base.Type => applyContactInvariants(customer)),
})

export const schema = CustomerArbitrarySchema
