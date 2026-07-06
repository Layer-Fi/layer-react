import { type Customer } from '@schemas/customer'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseCustomer: Customer = {
  id: '00000000-0000-4000-8000-000000000001',
  externalId: null,
  individualName: 'Jane Doe',
  companyName: 'Acme Corp',
  email: 'jane.doe@example.com',
  mobilePhone: null,
  officePhone: null,
  addressString: '123 Main St, Springfield, IL 62701',
  status: 'ACTIVE',
  memo: null,
}

export const { make: makeCustomer, makeMany: makeCustomers } =
  createFixtureFactory(baseCustomer)
