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
import { accountNames } from '@fixtures/constants/bank/accountNames'

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

/*
 * Suggested match ids must be valid UUIDs - the bulk-match-or-categorize
 * request schema validates them - so derive one from the transaction id by
 * swapping in a prefix outside the FixtureIdPrefix range.
 */
export const toSuggestedMatchId = (transactionId: string) =>
  transactionId.replace(/^[0-9a-f]{8}/, '00000010')

const STATUS_ROLL_CEILING = {
  matchedTransfer: 6,
  suggestedTransfer: 12,
  pending: 16,
  awaitingInput: 50,
  categorized: 80,
  split: 90,
} as const

const toMatchedBankTransaction = (
  { id, date, direction, amount, counterpartyName, description }: BankTransaction,
) => ({ id, date, direction, amount, counterpartyName, description })

const deriveTransfer = (
  transaction: BankTransaction,
  statusRoll: number,
  ref: number,
): BankTransaction => {
  const outbound = statusRoll % 2 === 0
  const accountName = transaction.accountName ?? 'Business Checking'
  const counterpartyAccounts = accountNames.filter(name => name !== accountName)
  const counterpartyAccount = counterpartyAccounts[ref % counterpartyAccounts.length]
  const fromAccountName = outbound ? accountName : counterpartyAccount
  const toAccountName = outbound ? counterpartyAccount : accountName

  const transfer: BankTransaction = {
    ...transaction,
    direction: outbound ? BankTransactionDirection.Debit : BankTransactionDirection.Credit,
    counterpartyName: null,
    description: `ONLINE TRANSFER ${outbound ? 'TO' : 'FROM'} ${counterpartyAccount.toUpperCase()} XXXXXX${String(ref).slice(0, 4)}`,
    customer: null,
    vendor: null,
  }

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

  if (statusRoll < STATUS_ROLL_CEILING.matchedTransfer) {
    return {
      ...transfer,
      categorizationStatus: CategorizationStatus.MATCHED,
      match: {
        id: `match-${transaction.id}`,
        matchType: MatchType.TRANSFER,
        bankTransaction: toMatchedBankTransaction(transfer),
        details,
      },
    }
  }

  return {
    ...transfer,
    categorizationStatus: CategorizationStatus.READY_FOR_INPUT,
    suggestedMatches: [{ id: toSuggestedMatchId(transaction.id), details }],
  }
}

const deriveMerchantMatch = (
  transaction: BankTransaction,
  merchant: BankTransactionMerchant,
): BankTransaction => {
  const isInflow = merchant.direction === BankTransactionDirection.Credit
  const details: MatchDetailsType = isInflow
    ? {
      type: 'Payout_Match',
      id: `match-details-${transaction.id}`,
      amount: transaction.amount,
      date: transaction.date,
      description: `Payout from ${merchant.name}`,
      adjustment: null,
    }
    : {
      type: 'Bill_Match',
      id: `match-details-${transaction.id}`,
      amount: transaction.amount,
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
      bankTransaction: toMatchedBankTransaction(transaction),
      details,
    },
  }
}

/*
 * The rolls are the single draw of randomness behind every correlated field:
 * statusRoll lands in the first STATUS_ROLL_CEILING bucket that exceeds it
 * (the gaps between ceilings are the status distribution; 90+ is a merchant
 * match), and the chosen merchant fixes direction, amount range, description,
 * and category suggestions together so the fields always agree.
 */
export const deriveBankTransaction = (
  transaction: BankTransaction,
  { merchantIndex, statusRoll, ref, amountRoll, splitPercent }: BankTransactionRolls,
): BankTransaction => {
  if (statusRoll < STATUS_ROLL_CEILING.suggestedTransfer) {
    return deriveTransfer(transaction, statusRoll, ref)
  }

  const merchant = bankTransactionMerchants[merchantIndex % bankTransactionMerchants.length]
  const [minDollars, maxDollars] = merchant.amountRange
  const amount = roundToCents(minDollars + (amountRoll % ((maxDollars - minDollars) * 100)) / 100)

  const merchantTransaction: BankTransaction = {
    ...transaction,
    direction: merchant.direction,
    amount,
    counterpartyName: merchant.name,
    description: merchant.describe(ref),
    customer: merchant.direction === BankTransactionDirection.Credit ? transaction.customer : null,
    vendor: merchant.direction === BankTransactionDirection.Debit ? transaction.vendor : null,
  }

  if (statusRoll < STATUS_ROLL_CEILING.pending) {
    return { ...merchantTransaction, categorizationStatus: CategorizationStatus.PENDING }
  }

  if (statusRoll < STATUS_ROLL_CEILING.awaitingInput) {
    return {
      ...merchantTransaction,
      categorizationStatus: CategorizationStatus.READY_FOR_INPUT,
      categorizationFlow: {
        type: InputStrategy.AskFromSuggestions,
        category: null,
        suggestions: [merchant.primary, ...merchant.alternates].map(toAccountCategorization),
      },
    }
  }

  if (statusRoll < STATUS_ROLL_CEILING.categorized || merchant.alternates.length === 0) {
    return {
      ...merchantTransaction,
      categorizationStatus: CategorizationStatus.CATEGORIZED,
      category: toAccountCategorization(merchant.primary),
    }
  }

  if (statusRoll < STATUS_ROLL_CEILING.split) {
    const primaryAmount = roundToCents(amount * (splitPercent / 100))
    const alternateAmount = roundToCents(amount - primaryAmount)

    return {
      ...merchantTransaction,
      categorizationStatus: CategorizationStatus.SPLIT,
      category: {
        type: 'Split_Categorization',
        id: `split-${transaction.id}`,
        category: 'SPLIT',
        displayName: 'Split',
        entries: [
          { type: 'AccountSplitEntry', amount: primaryAmount, category: toAccountCategorization(merchant.primary), tags: [] },
          { type: 'AccountSplitEntry', amount: alternateAmount, category: toAccountCategorization(merchant.alternates[0]), tags: [] },
        ],
      },
    }
  }

  return deriveMerchantMatch(merchantTransaction, merchant)
}

/** Moves a transaction to a new date, keeping the dates embedded in its matches in step. */
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
