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

export const toSuggestedMatchId = (transactionId: string) =>
  transactionId.replace(/^[0-9a-f]{8}/, '00000010')

export const toMatchDetailsId = (transactionId: string) =>
  transactionId.replace(/^[0-9a-f]{8}/, '00000011')

const toAlternateSuggestedMatchId = (transactionId: string, alternate: number) =>
  transactionId.replace(/^[0-9a-f]{8}/, `0000002${alternate}`)

const toAlternateMatchDetailsId = (transactionId: string, alternate: number) =>
  transactionId.replace(/^[0-9a-f]{8}/, `0000003${alternate}`)

const toMatchedBankTransaction = (transaction: BankTransaction) =>
  pick(transaction, ['id', 'date', 'direction', 'amount', 'counterpartyName', 'description'])

const formatDescriptionDate = (date: Date) => date.toISOString().slice(0, 10)

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
    // Descriptions mirror the API's MatchDetailsDescriptionGenerator templates.
    description: `Transfer from ${fromAccountName} to ${toAccountName}`,
    adjustment: null,
    fromAccountName,
    toAccountName,
  }

  const suggestedMatches = [{ id: toSuggestedMatchId(transaction.id), details }]

  // A transfer to another account is also a plausible candidate, so the match
  // table offers more than one row.
  const alternateCounterparty = counterpartyAccounts[(ref + 1) % counterpartyAccounts.length].accountName
  if (alternateCounterparty !== counterpartyAccount) {
    const alternateFrom = outbound ? accountName : alternateCounterparty
    const alternateTo = outbound ? alternateCounterparty : accountName

    suggestedMatches.push({
      id: toAlternateSuggestedMatchId(transaction.id, 1),
      details: {
        ...details,
        id: toAlternateMatchDetailsId(transaction.id, 1),
        description: `Transfer from ${alternateFrom} to ${alternateTo}`,
        fromAccountName: alternateFrom,
        toAccountName: alternateTo,
      },
    })
  }

  // The confirmed match stays in suggestedMatches: the match table renders
  // suggested rows and badges the one whose details id the match points at.
  if (matched) {
    return {
      ...transfer,
      categorizationStatus: CategorizationStatus.MATCHED,
      suggestedMatches,
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
    suggestedMatches,
  }
}

export const MATCH_TYPE_BY_DETAILS_TYPE: Record<MatchDetailsType['type'], MatchType> = {
  Transfer_Match: MatchType.TRANSFER,
  Payout_Match: MatchType.PAYOUT,
  Vendor_Payout_Match: MatchType.VENDOR_PAYOUT,
  Bill_Match: MatchType.BILL_PAYMENT,
  Invoice_Match: MatchType.INVOICE_PAYMENT,
  Refund_Payment_Match: MatchType.REFUND_PAYMENT,
  Vendor_Refund_Payment_Match: MatchType.VENDOR_REFUND_PAYMENT,
  Journal_Entry_Match: MatchType.MANUAL_JOURNAL_ENTRY,
  Payroll_Match: MatchType.PAYROLL_PAYMENT,
}

// The flavor comes from the merchant's own matchTypes, so the match always
// corresponds to the counterparty; ref/2 rotates within that list and stays
// decorrelated from the direction pick at ref % 2.
const merchantMatchDetails = (
  transaction: BankTransaction,
  merchant: BankTransactionMerchant,
  ref: number,
): MatchDetailsType => {
  const type = merchant.matchTypes[Math.floor(ref / 2) % merchant.matchTypes.length]

  const base = {
    id: toMatchDetailsId(transaction.id),
    amount: transaction.amount,
    date: transaction.date,
    adjustment: null,
  }

  // Descriptions mirror the API's MatchDetailsDescriptionGenerator templates.
  switch (type) {
    case 'Payout_Match':
      return {
        ...base,
        type,
        description: `Payout via ${merchant.name} created on ${formatDescriptionDate(transaction.date)}`,
      }
    case 'Invoice_Match':
      return {
        ...base,
        type,
        description: `Invoice payment via ${merchant.name} for 1 invoice with the following reference numbers: INV-${1000 + (ref % 9000)}`,
        invoiceIdentifiers: [{ id: `invoice-${transaction.id}`, referenceNumber: `INV-${1000 + (ref % 9000)}` }],
      }
    case 'Bill_Match':
      return {
        ...base,
        type,
        description: `Bill payment via ${merchant.name} for 1 bill`,
        billIdentifiers: [{ id: `bill-${transaction.id}` }],
      }
    case 'Refund_Payment_Match':
      return {
        ...base,
        type,
        description: `Refund payment via ${merchant.name}`,
        customerRefundIdentifiers: { id: `customer-refund-${transaction.id}` },
      }
    case 'Vendor_Refund_Payment_Match':
      return {
        ...base,
        type,
        description: `Vendor refund payment via ${merchant.name}`,
        vendorRefundIdentifiers: { id: `vendor-refund-${transaction.id}` },
      }
  }
}

// Only merchants that declare match flavors can appear as matches; credit
// merchants are a sliver of that pool, so alternate the direction to keep
// inflow match types visible alongside the outflow ones. Refund counterparties
// get a dedicated slice of the outflow picks - they'd rarely win a uniform
// draw against the sixteen bill merchants.
const pickMatchMerchant = (merchantIndex: number, ref: number): BankTransactionMerchant => {
  const wantInflow = ref % 2 === 0
  const matchable = bankTransactionMerchants.filter(candidate =>
    candidate.matchTypes.length > 0
    && (candidate.direction === BankTransactionDirection.Credit) === wantInflow)

  const wantRefund = !wantInflow && Math.floor(ref / 4) % 3 === 0
  const pool = matchable.filter(candidate =>
    candidate.matchTypes.includes('Refund_Payment_Match') === wantRefund)

  return pool[merchantIndex % pool.length]
}

const deriveMerchantMatch = (
  transaction: BankTransaction,
  merchant: BankTransactionMerchant,
  ref: number,
): BankTransaction => {
  const details = merchantMatchDetails(transaction, merchant, ref)

  return {
    ...transaction,
    categorizationStatus: CategorizationStatus.MATCHED,
    suggestedMatches: [{ id: toSuggestedMatchId(transaction.id), details }],
    match: {
      id: `match-${transaction.id}`,
      matchType: MATCH_TYPE_BY_DETAILS_TYPE[details.type],
      bankTransaction: toMatchedBankTransaction(transaction),
      details,
    },
  }
}

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

// A to-review transaction with a match candidate but nothing confirmed,
// alongside its category suggestions.
const deriveSuggestedMerchantMatch = (
  transaction: BankTransaction,
  merchant: BankTransactionMerchant,
  ref: number,
): BankTransaction => ({
  ...deriveAwaitingInput(transaction, merchant),
  suggestedMatches: [{
    id: toSuggestedMatchId(transaction.id),
    details: merchantMatchDetails(transaction, merchant, ref),
  }],
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
  const primaryAmount = Math.round(transaction.amount * (splitPercent / 100))
  const alternateAmount = transaction.amount - primaryAmount

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

  const toMerchantTransaction = (merchant: BankTransactionMerchant): BankTransaction => {
    // Amounts are integer cents drawn from the merchant's dollar range.
    const [minDollars, maxDollars] = merchant.amountRange
    const amount = minDollars * 100 + (amountRoll % ((maxDollars - minDollars) * 100 + 1))

    return {
      ...accountTransaction,
      direction: merchant.direction,
      amount,
      counterpartyName: merchant.name,
      description: merchant.describe(ref),
      customer: merchant.direction === BankTransactionDirection.Credit ? transaction.customer : null,
      vendor: merchant.direction === BankTransactionDirection.Debit ? transaction.vendor : null,
    }
  }

  const merchant = bankTransactionMerchants[merchantIndex % bankTransactionMerchants.length]
  const merchantTransaction = toMerchantTransaction(merchant)

  // Splits need an alternate category for the second entry; merchants without
  // one fall back to a plain categorization.
  const hasAlternates = merchant.alternates.length > 0

  return bankTransactionRollTable.handle(statusRoll, {
    [BankTransactionRollCase.MatchedTransfer]: () =>
      deriveTransfer(accountTransaction, { matched: true, outbound, ref }),
    [BankTransactionRollCase.SuggestedTransfer]: () =>
      deriveTransfer(accountTransaction, { matched: false, outbound, ref }),
    [BankTransactionRollCase.AwaitingInput]: () => deriveAwaitingInput(merchantTransaction, merchant),
    [BankTransactionRollCase.Categorized]: () => deriveCategorized(merchantTransaction, merchant),
    [BankTransactionRollCase.Split]: () =>
      hasAlternates
        ? deriveSplit(merchantTransaction, merchant, splitPercent)
        : deriveCategorized(merchantTransaction, merchant),
    [BankTransactionRollCase.SuggestedMerchantMatch]: () => {
      const matchMerchant = pickMatchMerchant(merchantIndex, ref)

      return deriveSuggestedMerchantMatch(toMerchantTransaction(matchMerchant), matchMerchant, ref)
    },
    [BankTransactionRollCase.MerchantMatch]: () => {
      const matchMerchant = pickMatchMerchant(merchantIndex, ref)

      return deriveMerchantMatch(toMerchantTransaction(matchMerchant), matchMerchant, ref)
    },
  })
}

// Payout descriptions embed a "created on" date, so it moves with the rest.
const withMatchDetailsDate = <TDetails extends { date: Date, description: string }>(
  details: TDetails,
  date: Date,
): TDetails => ({
  ...details,
  date,
  description: details.description.replace(/\d{4}-\d{2}-\d{2}/, formatDescriptionDate(date)),
})

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
      details: withMatchDetailsDate(transaction.match.details, date),
    },
  suggestedMatches: transaction.suggestedMatches.map(suggestedMatch => ({
    ...suggestedMatch,
    details: withMatchDetailsDate(suggestedMatch.details, date),
  })),
})
