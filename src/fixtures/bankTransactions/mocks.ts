import { CategorizationStatus, InputStrategy } from '@schemas/bankTransactions/bankTransaction'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'

import { type BankTransactionFixture } from '@fixtures/bankTransactions/schema'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseBankTransaction: BankTransactionFixture = {
  id: '00000000-0000-4000-8000-000000000010',
  businessId: '00000000-0000-4000-8000-000000000001',
  sourceTransactionId: 'src_txn_100000',
  sourceAccountId: 'acc_00000000000000000000000001',
  date: '2024-06-01T00:00:00.000Z',
  direction: BankTransactionDirection.Debit,
  amount: 54.21,
  counterpartyName: 'Amazon',
  description: 'AMAZON MKTPL*ZX81Q3 AMZN.COM/BILL WA',
  accountName: 'Primary Checking',
  accountMask: '0000',
  accountInstitution: { name: 'Chase', logo: null },
  categorizationStatus: CategorizationStatus.READY_FOR_INPUT,
  category: null,
  categorizationFlow: {
    type: InputStrategy.AskFromSuggestions,
    category: null,
    suggestions: [
      {
        type: 'Account',
        id: 'category-office-supplies',
        stableName: 'OFFICE_SUPPLIES',
        category: 'OFFICE_SUPPLIES',
        displayName: 'Office Supplies',
      },
      {
        type: 'Account',
        id: 'category-supplies',
        stableName: 'SUPPLIES',
        category: 'SUPPLIES',
        displayName: 'Supplies & Materials',
      },
    ],
  },
  taxCode: null,
  taxOptions: null,
  suggestedMatches: [],
  match: null,
  transactionTags: [],
  documentIds: [],
  memo: null,
  referenceNumber: null,
  metadata: null,
  customer: null,
  vendor: null,
  updateCategorizationRulesSuggestion: null,
}

export const { make: makeBankTransaction, makeMany: makeBankTransactions } =
  createFixtureFactory(baseBankTransaction)
