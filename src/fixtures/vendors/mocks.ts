import { type Vendor } from '@schemas/vendor'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseVendor: Vendor = {
  id: '00000000-0000-4000-8000-000000000002',
  externalId: 'ext_20002',
  individualName: 'John Smith',
  companyName: 'Stark Industries',
  email: 'john.smith@starkindustries.test',
  mobilePhone: '+15552223333',
  officePhone: '+15554445555',
  status: 'ACTIVE',
  memo: 'Preferred supplier',
}

export const { make: makeVendor, makeMany: makeVendors } =
  createFixtureFactory(baseVendor)
