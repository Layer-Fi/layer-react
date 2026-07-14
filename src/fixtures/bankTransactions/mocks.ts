import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus, InputStrategy } from '@schemas/bankTransactions/bankTransaction'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'

import { bankTransactionCategories } from '@fixtures/bankTransactions/constants'
import { toAccountCategorization } from '@fixtures/bankTransactions/utils'
import { makeBusiness } from '@fixtures/business/mocks'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseBankTransaction: BankTransaction = {
  id: '0000000f-0000-4000-8000-000000000001',
  businessId: makeBusiness().id,
  sourceTransactionId: 'src_txn_100000',
  sourceAccountId: 'acc_00000000000000000000000001',
  date: new Date('2025-06-01T15:45:00.000Z'),
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
      toAccountCategorization(bankTransactionCategories.officeSupplies),
      toAccountCategorization(bankTransactionCategories.supplies),
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
