import { makeStableName } from '@schemas/accountIdentifier'
import {
  BankDirectionFilter,
  type CategorizationRule,
} from '@schemas/bankTransactions/categorizationRules/categorizationRule'

import { makeBusiness } from '@fixtures/business/mocks'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const BUSINESS_ID = makeBusiness().id

const baseCategorizationRule: CategorizationRule = {
  id: '00000000-0000-4000-8000-000000000401',
  businessId: BUSINESS_ID,
  name: 'Software subscriptions',
  category: makeStableName('SOFTWARE'),
  suggestion1: null,
  suggestion2: null,
  suggestion3: null,
  counterpartyFilter: null,
  readableTransactionDescriptionFilter: 'Adobe',
  bankDirectionFilter: BankDirectionFilter.MONEY_OUT,
  amountMinFilter: null,
  amountMaxFilter: null,
  createdAt: new Date(Date.UTC(FIXTURE_YEAR, 0, 15, 12)),
  updatedAt: new Date(Date.UTC(FIXTURE_YEAR, 0, 15, 12)),
  archivedAt: null,
}

export const { make: makeCategorizationRule } = createFixtureFactory(baseCategorizationRule)

export const categorizationRules = {
  softwareSubscriptions: makeCategorizationRule(),
  stripePayouts: makeCategorizationRule({
    id: '00000000-0000-4000-8000-000000000402',
    name: 'Stripe payouts',
    category: makeStableName('SALES'),
    counterpartyFilter: { id: '00000000-0000-4000-8000-000000000410', name: 'Stripe', mccs: [] },
    readableTransactionDescriptionFilter: null,
    bankDirectionFilter: BankDirectionFilter.MONEY_IN,
    createdAt: new Date(Date.UTC(FIXTURE_YEAR, 2, 3, 12)),
    updatedAt: new Date(Date.UTC(FIXTURE_YEAR, 2, 3, 12)),
  }),
  coffeeRuns: makeCategorizationRule({
    id: '00000000-0000-4000-8000-000000000403',
    name: 'Coffee runs',
    category: makeStableName('MEALS'),
    readableTransactionDescriptionFilter: 'Starbucks',
    amountMaxFilter: 5000,
    createdAt: new Date(Date.UTC(FIXTURE_YEAR, 4, 20, 12)),
    updatedAt: new Date(Date.UTC(FIXTURE_YEAR, 4, 20, 12)),
  }),
  rideshare: makeCategorizationRule({
    id: '00000000-0000-4000-8000-000000000404',
    name: 'Rideshare',
    category: makeStableName('TRAVEL'),
    readableTransactionDescriptionFilter: 'Uber',
    createdAt: new Date(Date.UTC(FIXTURE_YEAR, 1, 1, 12)),
    updatedAt: new Date(Date.UTC(FIXTURE_YEAR, 1, 1, 12)),
  }),
  payrollRuns: makeCategorizationRule({
    id: '00000000-0000-4000-8000-000000000405',
    name: 'Payroll runs',
    category: makeStableName('PAYROLL_REGULAR_WAGES'),
    readableTransactionDescriptionFilter: 'Gusto',
    amountMinFilter: 80000,
    createdAt: new Date(Date.UTC(FIXTURE_YEAR, 3, 8, 12)),
    updatedAt: new Date(Date.UTC(FIXTURE_YEAR, 3, 8, 12)),
  }),
}
