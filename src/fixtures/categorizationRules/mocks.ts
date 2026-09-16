import { makeStableName } from '@schemas/common/accountIdentifier'
import { BankTransactionDirection } from '@schemas/features/bankTransactions/base'
import { type CategorizationRule } from '@schemas/features/categorization/categorizationRule'
import { BankDirectionFilter } from '@schemas/features/categorization/categorizationRuleFilters'
import { type UpdateCategorizationRulesSuggestion } from '@schemas/features/categorization/createCategorizationRule'

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

const AMAZON_COUNTERPARTY_ID = '00000000-0000-4000-8000-000000000411'

const baseRuleSuggestion: UpdateCategorizationRulesSuggestion = {
  type: 'Create_Categorization_Rule_For_Counterparty',
  newRule: {
    createdBySuggestionId: '00000000-0000-4000-8000-000000000501',
    category: makeStableName('OFFICE_EXPENSES'),
    counterpartyFilter: AMAZON_COUNTERPARTY_ID,
    applyRetroactively: true,
  },
  counterparty: { id: AMAZON_COUNTERPARTY_ID, name: 'Amazon', mccs: [] },
  suggestionPrompt:
    'Would you like to create a rule to automatically categorize transactions from Amazon as '
    + 'Office Expenses? You have categorized all 4 transactions from Amazon this way so far.',
  transactionsThatWillBeAffected: [
    {
      id: '0000000f-0000-4000-8000-000000000601',
      date: new Date(Date.UTC(FIXTURE_YEAR, 8, 2, 12)),
      direction: BankTransactionDirection.Debit,
      amount: 5580,
      counterpartyName: 'Amazon',
      description: 'AMAZON MKTPL*ZX81Q3',
    },
    {
      id: '0000000f-0000-4000-8000-000000000602',
      date: new Date(Date.UTC(FIXTURE_YEAR, 8, 17, 12)),
      direction: BankTransactionDirection.Debit,
      amount: 2640,
      counterpartyName: 'Amazon',
      description: 'AMAZON MKTPL*4KD02M',
    },
    {
      id: '0000000f-0000-4000-8000-000000000603',
      date: new Date(Date.UTC(FIXTURE_YEAR, 8, 26, 12)),
      direction: BankTransactionDirection.Debit,
      amount: 1680,
      counterpartyName: 'Amazon',
      description: 'AMAZON MKTPL*R71PQ9',
    },
    {
      id: '0000000f-0000-4000-8000-000000000604',
      date: new Date(Date.UTC(FIXTURE_YEAR, 9, 11, 12)),
      direction: BankTransactionDirection.Debit,
      amount: 3690,
      counterpartyName: 'Amazon',
      description: 'AMAZON MKTPL*88CV1T',
    },
  ],
}

export const { make: makeCategorizationRuleSuggestion } = createFixtureFactory(baseRuleSuggestion)
