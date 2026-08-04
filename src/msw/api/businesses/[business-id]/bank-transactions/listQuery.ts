import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { BankTransactionDirection, TransactionSource } from '@schemas/bankTransactions/base'

import { createListFilter, matchesAnyOf, matchesBoolean, matchesOnOrAfter, matchesOnOrBefore, matchesQuery } from '@msw/utils/createListFilter'
import { createListSorter } from '@msw/utils/createListSorter'

// Statuses the real endpoint treats as "categorized" for the `?categorized=` filter.
const CATEGORIZED_STATUSES: readonly CategorizationStatus[] = [
  CategorizationStatus.CATEGORIZED,
  CategorizationStatus.MATCHED,
  CategorizationStatus.SPLIT,
]

// Shared by the list endpoint and the excel export so a download matches the table.
export const filterBankTransactions = createListFilter<BankTransaction>({
  q: matchesQuery(transaction => [
    transaction.counterpartyName,
    transaction.description,
    transaction.accountName,
  ]),
  direction: (transaction, value) =>
    value == null || value === ''
    || transaction.direction === (value === 'INFLOW'
      ? BankTransactionDirection.Credit
      : BankTransactionDirection.Debit),
  categorized: matchesBoolean(transaction =>
    CATEGORIZED_STATUSES.includes(transaction.categorizationStatus)),
  start_date: matchesOnOrAfter(transaction => transaction.date),
  end_date: matchesOnOrBefore(transaction => transaction.date),
  amount_min: matchesOnOrAfter(transaction => transaction.amount),
  amount_max: matchesOnOrBefore(transaction => transaction.amount),
  source_account_ids: matchesAnyOf(transaction =>
    transaction.source === TransactionSource.CUSTOM ? transaction.externalAccountId : transaction.sourceAccountId),
})

export const sortBankTransactions = createListSorter<BankTransaction>({
  date: transaction => transaction.date.getTime(),
}, 'date')
