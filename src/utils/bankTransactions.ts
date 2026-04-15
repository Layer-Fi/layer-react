import { isWithinInterval, parseISO } from 'date-fns'

import { type BankTransaction, DisplayState, type Split, type SuggestedMatch } from '@internal-types/bankTransactions'
import { type DateRange } from '@internal-types/general'
import { Direction } from '@internal-types/general'
import type { TagFilterInput } from '@internal-types/tags'
import type { CategoryUpdate } from '@schemas/bankTransactions/categoryUpdate'
import { makeTagKeyValueFromTag } from '@schemas/tag'
import { CategorizedCategories, ReviewCategories } from '@components/BankTransactions/constants'

export const filterVisibility = (
  scope: DisplayState,
  bankTransaction: BankTransaction,
) => {
  const categorized = CategorizedCategories.includes(
    bankTransaction.categorization_status,
  )
  const inReview = ReviewCategories.includes(
    bankTransaction.categorization_status,
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

export const hasMatch = (bankTransaction?: BankTransaction) => {
  return Boolean(
    (bankTransaction?.suggested_matches
      && bankTransaction?.suggested_matches?.length > 0)
    || bankTransaction?.match,
  )
}

export const isCredit = ({ direction }: Pick<BankTransaction, 'direction'>) =>
  direction === Direction.CREDIT

export const countTransactionsToReview = ({
  transactions,
  dateRange,
}: {
  transactions?: BankTransaction[]
  dateRange?: DateRange
}) => {
  if (transactions && transactions.length > 0) {
    if (dateRange) {
      const dateRangeInterval = {
        start: dateRange.startDate,
        end: dateRange.endDate,
      }
      return transactions.filter((tx) => {
        try {
          return (
            filterVisibility(DisplayState.review, tx)
            && isWithinInterval(parseISO(tx.date), dateRangeInterval)
          )
        }
        catch (_err) {
          return false
        }
      }).length
    }
    return transactions.filter(tx => filterVisibility(DisplayState.review, tx))
      .length
  }

  return 0
}

export const hasReceipts = (bankTransaction?: BankTransaction) =>
  bankTransaction?.document_ids && bankTransaction.document_ids.length > 0

export const isTransferMatch = (bankTransaction?: BankTransaction) => {
  return bankTransaction?.match?.details.type === 'Transfer_Match'
}

export const hasSuggestedTransferMatches = (bankTransaction?: BankTransaction) => {
  return (
    (bankTransaction?.suggested_matches?.length ?? 0) > 0
    && bankTransaction?.suggested_matches?.every(x => x.details.type === 'Transfer_Match')
  )
}

export const getBankTransactionMatchAsSuggestedMatch = (bankTransaction?: BankTransaction): SuggestedMatch | undefined => {
  if (bankTransaction?.match) {
    const foundMatch = bankTransaction.suggested_matches?.find(
      x => x.details.id === bankTransaction?.match?.details.id
        || x.details.id === bankTransaction?.match?.bank_transaction.id,
    )
    return foundMatch
  }

  return undefined
}

export const getBankTransactionFirstSuggestedMatch = (bankTransaction?: BankTransaction): SuggestedMatch | undefined => {
  return getBankTransactionMatchAsSuggestedMatch(bankTransaction) ?? bankTransaction?.suggested_matches?.[0]
}

export enum BankTransactionsDateFilterMode {
  MonthlyView = 'MonthlyView',
  GlobalDateRange = 'GlobalDateRange',
}
export type BankTransactionFilters = {
  amount?: NumericRangeFilter
  account?: string[]
  direction?: Direction[]
  categorizationStatus?: DisplayState
  dateRange?: DateRange
  query?: string
  tagFilter?: TagFilterInput
}
export const isCategorized = (bankTransaction: BankTransaction) => CategorizedCategories.includes(bankTransaction.categorization_status)
export const buildCategorizeBankTransactionPayloadForSplit = (splits: Split[]): CategoryUpdate => {
  return splits.length === 1 && splits[0].category
    ? ({
      type: 'Category',
      category: splits[0].category.classification!,
      taxCode: splits[0].taxCode,
    })
    : ({
      type: 'Split',
      entries: splits.map(split => ({
        // TODO: enforce upstream in the category combobox that split.category is non-null
        category: split.category!.classification!,
        amount: split.amount,
        taxCode: split.taxCode,
        tags: split.tags.map(tag => makeTagKeyValueFromTag(tag)),
        customerId: split.customerVendor?.customerVendorType === 'CUSTOMER' ? split.customerVendor.id : undefined,
        vendorId: split.customerVendor?.customerVendorType === 'VENDOR' ? split.customerVendor.id : undefined,
      })),
    })
}
