import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus, InputStrategy } from '@schemas/bankTransactions/bankTransaction'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'

import { makeBankAccount } from '@fixtures/bankAccounts/mocks'
import { bankTransactionCategories } from '@fixtures/bankTransactions/constants'
import { toAccountCategorization } from '@fixtures/bankTransactions/derive'
import { makeBusiness } from '@fixtures/business/mocks'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const account = makeBankAccount()

const baseBankTransaction: BankTransaction = {
  id: '0000000f-0000-4000-8000-000000000001',
  businessId: makeBusiness().id,
  sourceTransactionId: 'src_txn_100000',
  sourceAccountId: account.externalAccounts[0]?.id ?? account.id,
  date: new Date('2025-06-01T15:45:00.000Z'),
  direction: BankTransactionDirection.Debit,
  amount: 5421,
  counterpartyName: 'Amazon',
  description: 'AMAZON MKTPL*ZX81Q3 AMZN.COM/BILL WA',
  accountName: account.accountName,
  accountMask: account.mask,
  accountInstitution: account.institution,
  categorizationStatus: CategorizationStatus.READY_FOR_INPUT,
  category: null,
  categorizationFlow: {
    type: InputStrategy.AskFromSuggestions,
    category: null,
    suggestions: [
      toAccountCategorization(bankTransactionCategories.officeExpenses),
      toAccountCategorization(bankTransactionCategories.costOfGoodsSold),
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
