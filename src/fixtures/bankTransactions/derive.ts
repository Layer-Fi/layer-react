import { pick } from 'lodash-es'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus, InputStrategy } from '@schemas/bankTransactions/bankTransaction'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import { type MatchDetailsType, MatchType } from '@schemas/bankTransactions/match'
import { type AccountCategorizationSchema } from '@schemas/categorization'

import {
  type BankTransactionCategory,
  type BankTransactionMerchant,
  bankTransactionMerchants,
} from '@fixtures/bankTransactions/constants'
import {
  BankTransactionRollCase,
  type BankTransactionRolls,
  bankTransactionRollTable,
} from '@fixtures/bankTransactions/roll'
import { bankAccounts } from '@fixtures/generated/bankAccounts.gen'

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

export const toSuggestedMatchId = (transactionId: string) =>
  transactionId.replace(/^[0-9a-f]{8}/, '00000010')

export const toMatchDetailsId = (transactionId: string) =>
  transactionId.replace(/^[0-9a-f]{8}/, '00000011')

const toMatchedBankTransaction = (transaction: BankTransaction) =>
  pick(transaction, ['id', 'date', 'direction', 'amount', 'counterpartyName', 'description'])

const deriveTransfer = (
  transaction: BankTransaction,
  { matched, outbound, ref }: { matched: boolean, outbound: boolean, ref: number },
): BankTransaction => {
  const accountName = transaction.accountName ?? bankAccounts[0].accountName
  const counterpartyAccounts = bankAccounts.filter(account => account.accountName !== accountName)
  const counterpartyAccount = counterpartyAccounts[ref % counterpartyAccounts.length].accountName
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
    id: toMatchDetailsId(transaction.id),
    amount: transaction.amount,
    date: transaction.date,
    description: `Transfer between ${fromAccountName} and ${toAccountName}`,
    adjustment: null,
    fromAccountName,
    toAccountName,
  }

  if (matched) {
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
      id: toMatchDetailsId(transaction.id),
      amount: transaction.amount,
      date: transaction.date,
      description: `Payout from ${merchant.name}`,
      adjustment: null,
    }
    : {
      type: 'Bill_Match',
      id: toMatchDetailsId(transaction.id),
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

const derivePending = (transaction: BankTransaction): BankTransaction => ({
  ...transaction,
  categorizationStatus: CategorizationStatus.PENDING,
})

const deriveAwaitingInput = (
  transaction: BankTransaction,
  merchant: BankTransactionMerchant,
): BankTransaction => ({
  ...transaction,
  categorizationStatus: CategorizationStatus.READY_FOR_INPUT,
  categorizationFlow: {
    type: InputStrategy.AskFromSuggestions,
    category: null,
    suggestions: [merchant.primary, ...merchant.alternates].map(toAccountCategorization),
  },
})

const deriveCategorized = (
  transaction: BankTransaction,
  merchant: BankTransactionMerchant,
): BankTransaction => ({
  ...transaction,
  categorizationStatus: CategorizationStatus.CATEGORIZED,
  category: toAccountCategorization(merchant.primary),
})

const deriveSplit = (
  transaction: BankTransaction,
  merchant: BankTransactionMerchant,
  splitPercent: number,
): BankTransaction => {
  const primaryAmount = roundToCents(transaction.amount * (splitPercent / 100))
  const alternateAmount = roundToCents(transaction.amount - primaryAmount)

  return {
    ...transaction,
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

export const deriveBankTransaction = (
  transaction: BankTransaction,
  { accountIndex, merchantIndex, statusRoll, ref, amountRoll, splitPercent }: BankTransactionRolls,
): BankTransaction => {
  const outbound = statusRoll % 2 === 0

  // Each transaction belongs to one of the pooled bank accounts, so its
  // account fields agree with what the bank-accounts mock serves.
  const account = bankAccounts[accountIndex % bankAccounts.length]
  const accountTransaction: BankTransaction = {
    ...transaction,
    accountName: account.accountName,
    accountMask: account.mask,
    accountInstitution: account.institution,
    sourceAccountId: account.externalAccounts[0]?.id ?? account.id,
  }

  const merchant = bankTransactionMerchants[merchantIndex % bankTransactionMerchants.length]
  const [minDollars, maxDollars] = merchant.amountRange
  const amount = roundToCents(minDollars + (amountRoll % ((maxDollars - minDollars) * 100)) / 100)

  const merchantTransaction: BankTransaction = {
    ...accountTransaction,
    direction: merchant.direction,
    amount,
    counterpartyName: merchant.name,
    description: merchant.describe(ref),
    customer: merchant.direction === BankTransactionDirection.Credit ? transaction.customer : null,
    vendor: merchant.direction === BankTransactionDirection.Debit ? transaction.vendor : null,
  }

  // Splits need an alternate category for the second entry; merchants without
  // one fall back to a plain categorization.
  const hasAlternates = merchant.alternates.length > 0

  return bankTransactionRollTable.handle(statusRoll, {
    [BankTransactionRollCase.MatchedTransfer]: () =>
      deriveTransfer(accountTransaction, { matched: true, outbound, ref }),
    [BankTransactionRollCase.SuggestedTransfer]: () =>
      deriveTransfer(accountTransaction, { matched: false, outbound, ref }),
    [BankTransactionRollCase.Pending]: () => derivePending(merchantTransaction),
    [BankTransactionRollCase.AwaitingInput]: () => deriveAwaitingInput(merchantTransaction, merchant),
    [BankTransactionRollCase.Categorized]: () => deriveCategorized(merchantTransaction, merchant),
    [BankTransactionRollCase.Split]: () =>
      hasAlternates
        ? deriveSplit(merchantTransaction, merchant, splitPercent)
        : deriveCategorized(merchantTransaction, merchant),
    [BankTransactionRollCase.MerchantMatch]: () =>
      hasAlternates
        ? deriveMerchantMatch(merchantTransaction, merchant)
        : deriveCategorized(merchantTransaction, merchant),
  })
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
