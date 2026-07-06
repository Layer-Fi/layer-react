import { type Vendor } from '@schemas/vendor'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseVendor: Vendor = {
  id: '00000000-0000-4000-8000-000000000001',
  externalId: null,
  individualName: null,
  companyName: 'Globex LLC',
  email: 'contact@globexllc.test',
  mobilePhone: null,
  officePhone: null,
  status: 'ACTIVE',
  memo: null,
}

export const { make: makeVendor, makeMany: makeVendors } =
  createFixtureFactory(baseVendor)
