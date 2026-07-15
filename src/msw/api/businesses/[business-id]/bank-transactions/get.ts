import { Schema } from 'effect'

import { type BankTransaction } from '@internal-types/bankTransactions'
import {
  BankTransactionSchema,
  CategorizationStatus,
} from '@schemas/bankTransactions/bankTransaction'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'

import { bankTransactionStore } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesBoolean, matchesOnOrAfter, matchesOnOrBefore, matchesQuery } from '@msw/utils/createListFilter'
import { createListSorter } from '@msw/utils/createListSorter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeBankTransaction = Schema.encodeSync(BankTransactionSchema)

const toResponse = (transactions: readonly BankTransaction[], request: Request) =>
  paginatedApiData(transactions.map(transaction => encodeBankTransaction(transaction)), request)

// Statuses the real endpoint treats as "categorized" for the `?categorized=` filter.
const CATEGORIZED_STATUSES: readonly CategorizationStatus[] = [
  CategorizationStatus.CATEGORIZED,
  CategorizationStatus.MATCHED,
  CategorizationStatus.SPLIT,
]

const filterBankTransactions = createListFilter<BankTransaction>({
  q: matchesQuery(transaction => [
    transaction.counterpartyName,
    transaction.description,
    transaction.accountName,
  ]),
  direction: (transaction, value) =>
    value == null || value === ''
    || transaction.direction === (value === 'INFLOW'
      ? BankTransactionDirection.MoneyIn
      : BankTransactionDirection.MoneyOut),
  categorized: matchesBoolean(transaction =>
    CATEGORIZED_STATUSES.includes(transaction.categorizationStatus)),
  start_date: matchesOnOrAfter(transaction => transaction.date),
  end_date: matchesOnOrBefore(transaction => transaction.date),
  amount_min: matchesOnOrAfter(transaction => transaction.amount),
  amount_max: matchesOnOrBefore(transaction => transaction.amount),
})

const sortBankTransactions = createListSorter<BankTransaction>({
  date: transaction => transaction.date.getTime(),
}, 'date')

export const get = createMockEndpoint<readonly BankTransaction[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bank-transactions',
  resolve: ({ override: transactions = bankTransactionStore.all(), request }) =>
    toResponse(
      sortBankTransactions(filterBankTransactions(transactions, request), request),
      request,
    ),
})
