import { type BankTransaction, DisplayState, type Split, type SuggestedMatch } from '@internal-types/bankTransactions'
import { SuggestedMatchAsOption } from '@internal-types/categorizationOption'
import { type DateRange } from '@internal-types/general'
import { type Direction } from '@internal-types/general'
import type { TagFilterInput } from '@internal-types/tags'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import type { CategoryUpdate } from '@schemas/bankTransactions/categoryUpdate'
import { makeTagKeyValueFromTag } from '@schemas/tag'
import { getDefaultTaxCodeForBankTransaction } from '@utils/bankTransactions/taxCode'
import { BankTransactionSelectionVariant } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
import { convertApiCategorizationToCategoryOrSplitAsOption } from '@components/BankTransactionCategoryComboBox/utils'
import { CategorizedCategories, ReviewCategories } from '@components/BankTransactions/constants'

export const filterVisibility = (
  scope: DisplayState,
  bankTransaction: BankTransaction,
) => {
  const categorized = CategorizedCategories.includes(
    bankTransaction.categorizationStatus,
  )
  const inReview = ReviewCategories.includes(
    bankTransaction.categorizationStatus,
  )

  return (
    scope === DisplayState.all
    || (scope === DisplayState.review && inReview)
    || (scope === DisplayState.categorized && categorized)
  )
}

export interface NumericRangeFilter {
  min?: number
  max?: number
}

export enum BankTransactionsDateFilterMode {
  MonthlyView = 'MonthlyView',
  GlobalDateRange = 'GlobalDateRange',
}

export const hasMatch = (bankTransaction?: BankTransaction) => {
  return Boolean(
    (bankTransaction?.suggestedMatches
      && bankTransaction?.suggestedMatches?.length > 0)
    || bankTransaction?.match,
  )
}

export const isCredit = ({ direction }: Pick<BankTransaction, 'direction'>) =>
  direction === BankTransactionDirection.Credit

export const hasReceipts = (bankTransaction?: BankTransaction) =>
  bankTransaction?.documentIds && bankTransaction.documentIds.length > 0

export const isTransferMatch = (bankTransaction?: BankTransaction) => {
  return bankTransaction?.match?.details.type === 'Transfer_Match'
}

export const hasSuggestedTransferMatches = (bankTransaction?: BankTransaction) => {
  return (
    (bankTransaction?.suggestedMatches?.length ?? 0) > 0
    && bankTransaction?.suggestedMatches?.every(x => x.details.type === 'Transfer_Match')
  )
}

export const hasSuggestions = (bankTransaction?: BankTransaction) =>
  (bankTransaction?.categorizationFlow?.suggestions.length ?? 0) > 0

export const getBankTransactionMatchAsSuggestedMatch = (bankTransaction?: BankTransaction): SuggestedMatch | undefined => {
  if (bankTransaction?.match) {
    const foundMatch = bankTransaction.suggestedMatches?.find(
      x => x.details.id === bankTransaction?.match?.details.id
        || x.details.id === bankTransaction?.match?.bankTransaction.id,
    )
    return foundMatch
  }

  return undefined
}

export const getSuggestedMatchForBankTransaction = (bankTransaction?: BankTransaction): SuggestedMatch | undefined => {
  return getBankTransactionMatchAsSuggestedMatch(bankTransaction) ?? bankTransaction?.suggestedMatches?.[0]
}

export const getBankTransactionFirstSuggestedMatch = (bankTransaction?: BankTransaction): SuggestedMatch | undefined => {
  return getSuggestedMatchForBankTransaction(bankTransaction)
}

export const getDefaultSuggestedMatchForBankTransaction = (bankTransaction?: BankTransaction): SuggestedMatchAsOption | null => {
  const suggestedMatch = getSuggestedMatchForBankTransaction(bankTransaction)

  return suggestedMatch ? new SuggestedMatchAsOption(suggestedMatch) : null
}

export const getDefaultSelectedCategoryForBankTransaction = (
  bankTransaction: BankTransaction,
): BankTransactionNonSuggestedMatchOption | null => {
  if (bankTransaction.category) {
    return convertApiCategorizationToCategoryOrSplitAsOption(bankTransaction.category)
  }

  if (hasSuggestions(bankTransaction)) {
    return convertApiCategorizationToCategoryOrSplitAsOption(bankTransaction.categorizationFlow!.suggestions[0])
  }

  return null
}

export const getDefaultVariantForBankTransaction = (bankTransaction: BankTransaction): BankTransactionSelectionVariant => {
  if (bankTransaction.match) return BankTransactionSelectionVariant.MATCH
  if (bankTransaction.category) return BankTransactionSelectionVariant.CATEGORY

  return getSuggestedMatchForBankTransaction(bankTransaction) ? BankTransactionSelectionVariant.MATCH : BankTransactionSelectionVariant.CATEGORY
}

export type BankTransactionFilters = {
  amount?: NumericRangeFilter
  sourceAccountIds?: string[]
  bankAccountIds?: string[]
  direction?: Direction[]
  categorizationStatus?: DisplayState
  dateRange?: DateRange
  query?: string
  tagFilter?: TagFilterInput
}

export const isCategorized = (bankTransaction: BankTransaction) => CategorizedCategories.includes(bankTransaction.categorizationStatus)
export const buildCategorizeBankTransactionPayloadForSplit = (splits: Split[]): CategoryUpdate => {
  return splits.length === 1 && splits[0].category
    ? ({
      type: 'Category',
      category: splits[0].category.classification!,
      taxCode: splits[0].taxCode ?? null,
    })
    : ({
      type: 'Split',
      entries: splits.map(split => ({
        category: split.category!.classification!,
        amount: split.amount,
        taxCode: split.taxCode ?? null,
        tags: split.tags.map(tag => makeTagKeyValueFromTag(tag)),
        customerId: split.customerVendor?.customerVendorType === 'CUSTOMER' ? split.customerVendor.id : undefined,
        vendorId: split.customerVendor?.customerVendorType === 'VENDOR' ? split.customerVendor.id : undefined,
      })),
    })
}

export const getDefaultCategorizationForBankTransaction = (bankTransaction: BankTransaction) => {
  return {
    category: getDefaultSelectedCategoryForBankTransaction(bankTransaction),
    taxCode: getDefaultTaxCodeForBankTransaction(bankTransaction),
    match: getDefaultSuggestedMatchForBankTransaction(bankTransaction),
    variant: getDefaultVariantForBankTransaction(bankTransaction),
  }
}
