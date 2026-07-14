import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { type CategoryUpdate, type SplitCategoryEntrySchema } from '@schemas/bankTransactions/categoryUpdate'
import { type Match, MatchType } from '@schemas/bankTransactions/match'
import {
  type AccountCategorizationSchema,
  type Classification,
  type ExclusionCategorizationSchema,
  type SplitCategorizationEntrySchema,
} from '@schemas/categorization'
import { type TransactionTag } from '@schemas/tag'

import { bankTransactionCategories } from '@fixtures/bankTransactions/constants'
import { toAccountCategorization } from '@fixtures/bankTransactions/utils'
import { accountNames } from '@fixtures/constants/bank/accountNames'

type AccountCategorization = typeof AccountCategorizationSchema.Type
type ExclusionCategorization = typeof ExclusionCategorizationSchema.Type
type SplitEntry = typeof SplitCategorizationEntrySchema.Type
type SplitCategoryEntry = typeof SplitCategoryEntrySchema.Type

const toTitleCase = (stableName: string) =>
  stableName
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const KNOWN_CATEGORIES = Object.values(bankTransactionCategories)

/*
 * Resolves a request's classification against the fixture category catalog,
 * synthesizing a plausible categorization when the request references an
 * account the catalog doesn't know about.
 */
const toCategorization = (
  classification: Classification,
): AccountCategorization | ExclusionCategorization => {
  if (classification.type === 'Exclusion') {
    return {
      type: 'Exclusion',
      id: `exclusion-${classification.exclusionType.toLowerCase()}`,
      category: classification.exclusionType,
      displayName: toTitleCase(classification.exclusionType),
    }
  }

  if (classification.type === 'StableName') {
    const known = KNOWN_CATEGORIES.find(category => category.stableName === classification.stableName)
    if (known) return toAccountCategorization(known)

    return {
      type: 'Account',
      id: `category-${classification.stableName.toLowerCase().replaceAll('_', '-')}`,
      stableName: classification.stableName,
      category: classification.stableName,
      displayName: toTitleCase(classification.stableName),
    }
  }

  const known = KNOWN_CATEGORIES.find(category => category.id === classification.id)
  if (known) return toAccountCategorization(known)

  return {
    type: 'Account',
    id: classification.id,
    stableName: null,
    category: classification.id,
    displayName: classification.id,
  }
}

const toTransactionTag = ({ key, value, dimensionDisplayName, valueDisplayName }: {
  key: string
  value: string
  dimensionDisplayName?: string | null
  valueDisplayName?: string | null
}): TransactionTag => {
  const now = new Date()

  return {
    id: crypto.randomUUID(),
    key,
    value,
    dimensionDisplayName: dimensionDisplayName ?? null,
    valueDisplayName: valueDisplayName ?? null,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
    deletedAt: null,
  }
}

const toSplitEntry = (entry: SplitCategoryEntry): SplitEntry => {
  const category = toCategorization(entry.category)
  const shared = {
    amount: entry.amount,
    taxCode: entry.taxCode ?? null,
    tags: (entry.tags ?? []).map(toTransactionTag),
  }

  return category.type === 'Exclusion'
    ? { type: 'ExclusionSplitEntry', category, ...shared }
    : { type: 'AccountSplitEntry', category, ...shared }
}

export const applyCategoryUpdate = (
  transaction: BankTransaction,
  update: CategoryUpdate,
): BankTransaction => {
  if (update.type === 'Split') {
    return {
      ...transaction,
      categorizationStatus: CategorizationStatus.SPLIT,
      category: {
        type: 'Split_Categorization',
        id: `split-${transaction.id}`,
        category: 'SPLIT',
        displayName: 'Split',
        entries: update.entries.map(toSplitEntry),
      },
      categorizationFlow: null,
      match: null,
      suggestedMatches: [],
    }
  }

  return {
    ...transaction,
    categorizationStatus: CategorizationStatus.CATEGORIZED,
    category: toCategorization(update.category),
    taxCode: update.taxCode ?? transaction.taxCode,
    categorizationFlow: null,
    match: null,
    suggestedMatches: [],
  }
}

export const applyUncategorize = (transaction: BankTransaction): BankTransaction => ({
  ...transaction,
  categorizationStatus: CategorizationStatus.READY_FOR_INPUT,
  category: null,
  match: null,
})

const MATCH_TYPE_BY_DETAILS_TYPE: Record<
  NonNullable<BankTransaction['match']>['details']['type'],
  MatchType
> = {
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

/*
 * Confirms one of the transaction's suggested matches, falling back to a
 * synthesized transfer match when the id isn't among the suggestions - the
 * mutation is then still visible to the UI.
 */
export const applyConfirmedMatch = (
  transaction: BankTransaction,
  suggestedMatchId: string,
): { transaction: BankTransaction, match: Match } => {
  const suggestedMatch = transaction.suggestedMatches.find(match => match.id === suggestedMatchId)

  const fromAccountName = transaction.accountName ?? 'Business Checking'

  const details = suggestedMatch?.details ?? {
    type: 'Transfer_Match',
    id: `match-details-${transaction.id}`,
    amount: transaction.amount,
    date: transaction.date,
    description: transaction.description ?? 'Transfer',
    adjustment: null,
    fromAccountName,
    toAccountName: accountNames.find(name => name !== fromAccountName) ?? 'Savings',
  }

  const match: Match = {
    id: suggestedMatchId,
    matchType: MATCH_TYPE_BY_DETAILS_TYPE[details.type],
    bankTransaction: {
      id: transaction.id,
      date: transaction.date,
      direction: transaction.direction,
      amount: transaction.amount,
      counterpartyName: transaction.counterpartyName,
      description: transaction.description,
    },
    details,
  }

  return {
    transaction: {
      ...transaction,
      categorizationStatus: CategorizationStatus.MATCHED,
      category: null,
      categorizationFlow: null,
      match,
      suggestedMatches: transaction.suggestedMatches.filter(match => match.id !== suggestedMatchId),
    },
    match,
  }
}
