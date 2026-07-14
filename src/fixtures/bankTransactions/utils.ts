import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus, InputStrategy } from '@schemas/bankTransactions/bankTransaction'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import { type MatchDetailsType, MatchType } from '@schemas/bankTransactions/match'
import { type AccountCategorizationSchema } from '@schemas/categorization'

import { type BankTransactionRolls } from '@fixtures/bankTransactions/arbitrary'
import {
  type BankTransactionCategory,
  type BankTransactionMerchant,
  bankTransactionMerchants,
} from '@fixtures/bankTransactions/constants'

type AccountCategorization = typeof AccountCategorizationSchema.Type

export const toAccountCategorization = (
  category: BankTransactionCategory,
): AccountCategorization => ({
  type: 'Account',
  id: category.id,
  stableName: category.stableName,
  category: category.stableName,
  displayName: category.displayName,
})

const roundToCents = (amount: number) => Math.round(amount * 100) / 100

const deriveTransfer = (
  transaction: BankTransaction,
  statusRoll: number,
  ref: number,
): BankTransaction => {
  const outbound = statusRoll % 2 === 0
  const accountName = transaction.accountName ?? 'Business Checking'
  const fromAccountName = outbound ? accountName : 'Savings'
  const toAccountName = outbound ? 'Savings' : accountName
  const description = outbound
    ? `ONLINE TRANSFER TO SAVINGS ACCOUNT XXXXXX${String(ref).slice(0, 4)}`
    : `ONLINE TRANSFER FROM SAVINGS ACCOUNT XXXXXX${String(ref).slice(0, 4)}`

  const details: MatchDetailsType = {
    type: 'Transfer_Match',
    id: `match-details-${transaction.id}`,
    amount: transaction.amount,
    date: transaction.date,
    description: `Transfer between ${fromAccountName} and ${toAccountName}`,
    adjustment: null,
    fromAccountName,
    toAccountName,
  }

  const common = {
    ...transaction,
    direction: outbound ? BankTransactionDirection.Debit : BankTransactionDirection.Credit,
    counterpartyName: null,
    description,
    customer: null,
    vendor: null,
  }

  // Half the transfers are already matched; the other half surface a
  // suggested transfer match awaiting review.
  if (statusRoll < 6) {
    return {
      ...common,
      categorizationStatus: CategorizationStatus.MATCHED,
      match: {
        id: `match-${transaction.id}`,
        matchType: MatchType.TRANSFER,
        bankTransaction: {
          id: transaction.id,
          date: transaction.date,
          direction: common.direction,
          amount: transaction.amount,
          counterpartyName: null,
          description,
        },
        details,
      },
    }
  }

  return {
    ...common,
    categorizationStatus: CategorizationStatus.READY_FOR_INPUT,
    suggestedMatches: [{ id: `suggested-match-${transaction.id}`, details }],
  }
}

const deriveMerchantMatch = (
  transaction: BankTransaction,
  merchant: BankTransactionMerchant,
  amount: number,
  description: string,
): BankTransaction => {
  const isInflow = merchant.direction === BankTransactionDirection.Credit
  const details: MatchDetailsType = isInflow
    ? {
      type: 'Payout_Match',
      id: `match-details-${transaction.id}`,
      amount,
      date: transaction.date,
      description: `Payout from ${merchant.name}`,
      adjustment: null,
    }
    : {
      type: 'Bill_Match',
      id: `match-details-${transaction.id}`,
      amount,
      date: transaction.date,
      description: `Bill payment to ${merchant.name}`,
      adjustment: null,
      billIdentifiers: [{ id: `bill-${transaction.id}` }],
    }

  return {
    ...transaction,
    categorizationStatus: CategorizationStatus.MATCHED,
    match: {
      id: `match-${transaction.id}`,
      matchType: isInflow ? MatchType.PAYOUT : MatchType.BILL_PAYMENT,
      bankTransaction: {
        id: transaction.id,
        date: transaction.date,
        direction: merchant.direction,
        amount,
        counterpartyName: merchant.name,
        description,
      },
      details,
    },
  }
}

export const deriveBankTransaction = (
  transaction: BankTransaction,
  { merchantIndex, statusRoll, ref, amountRoll, splitPercent }: BankTransactionRolls,
): BankTransaction => {
  if (statusRoll < 12) return deriveTransfer(transaction, statusRoll, ref)

  const merchant = bankTransactionMerchants[merchantIndex % bankTransactionMerchants.length]
  const [min, max] = merchant.amountRange
  const amount = roundToCents(min + (amountRoll % ((max - min) * 100)) / 100)
  const description = merchant.describe(ref)

  const common = {
    ...transaction,
    direction: merchant.direction,
    amount,
    counterpartyName: merchant.name,
    description,
    // Keep the pool-drawn counterparty that matches the money flow:
    // customers on inflows, vendors on outflows.
    customer: merchant.direction === BankTransactionDirection.Credit ? transaction.customer : null,
    vendor: merchant.direction === BankTransactionDirection.Debit ? transaction.vendor : null,
  }

  if (statusRoll < 16) {
    return { ...common, categorizationStatus: CategorizationStatus.PENDING }
  }

  if (statusRoll < 50) {
    return {
      ...common,
      categorizationStatus: CategorizationStatus.READY_FOR_INPUT,
      categorizationFlow: {
        type: InputStrategy.AskFromSuggestions,
        category: null,
        suggestions: [merchant.primary, ...merchant.alternates].map(toAccountCategorization),
      },
    }
  }

  if (statusRoll < 80 || merchant.alternates.length === 0) {
    return {
      ...common,
      categorizationStatus: CategorizationStatus.CATEGORIZED,
      category: toAccountCategorization(merchant.primary),
    }
  }

  if (statusRoll < 90) {
    const firstAmount = roundToCents(amount * (splitPercent / 100))
    const secondAmount = roundToCents(amount - firstAmount)
    return {
      ...common,
      categorizationStatus: CategorizationStatus.SPLIT,
      category: {
        type: 'Split_Categorization',
        id: `split-${transaction.id}`,
        category: 'SPLIT',
        displayName: 'Split',
        entries: [
          { type: 'AccountSplitEntry', amount: firstAmount, category: toAccountCategorization(merchant.primary), tags: [] },
          { type: 'AccountSplitEntry', amount: secondAmount, category: toAccountCategorization(merchant.alternates[0]), tags: [] },
        ],
      },
    }
  }

  return deriveMerchantMatch(common, merchant, amount, description)
}

/*
 * Moves a transaction to a new date, keeping the dates embedded in its
 * applied/suggested matches in step - the generator uses this to respread
 * transactions across the fixture year after derivation.
 */
export const withBankTransactionDate = (
  transaction: BankTransaction,
  date: Date,
): BankTransaction => ({
  ...transaction,
  date,
  match: transaction.match == null
    ? transaction.match
    : {
      ...transaction.match,
      bankTransaction: { ...transaction.match.bankTransaction, date },
      details: { ...transaction.match.details, date },
    },
  suggestedMatches: transaction.suggestedMatches.map(suggestedMatch => ({
    ...suggestedMatch,
    details: { ...suggestedMatch.details, date },
  })),
})
