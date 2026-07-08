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
} from '@fixtures/utils/contactFields'
import { externalIdArbitrary } from '@fixtures/utils/externalIdArbitrary'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/idArbitrary'
import { nullableConstantFrom } from '@fixtures/utils/nullableConstantFromArbitrary'
import { withArbitrary } from '@fixtures/utils/withArbitrary'

const { _local, ...fields } = CustomerSchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.customer)),
  externalId: withArbitrary(fields.externalId, () => externalIdArbitrary),
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
