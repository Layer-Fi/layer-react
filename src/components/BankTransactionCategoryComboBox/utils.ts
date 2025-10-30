import { CategorizationStatus } from '../../schemas/bankTransactions/bankTransaction'
import { type CategorizationEncoded, type NestedCategorization, isSplitCategorizationEncoded } from '../../schemas/categorization'
import type { BankTransaction, SuggestedMatch } from '../../types/bank_transactions'
import { CategorizationType, hasSuggestions } from '../../types/categories'
import { ApiCategorizationAsOption, CategoryAsOption, PlaceholderAsOption, SplitAsOption, SuggestedMatchAsOption } from '../../types/categorizationOption'
import { type BankTransactionCategoryComboBoxOption } from '../../components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { decodeCustomerVendor } from '../../features/customerVendor/customerVendorSchemas'
import { TransactionTagSchema } from '../../features/tags/tagSchemas'
import { centsToDollars as formatMoney } from '../../models/Money'
import { Schema } from 'effect/index'
import { makeTagFromTransactionTag } from '../../features/tags/tagSchemas'

export enum BankTransactionCategoryComboBoxGroupLabel {
  TRANSFER = 'TRANSFER',
  MATCH = 'MATCH',
  SUGGESTIONS = 'SUGGESTIONS',
  ALL_CATEGORIES = 'ALL CATEGORIES',
}

export const convertCategorizationToOption = (categorization: CategorizationEncoded): BankTransactionCategoryComboBoxOption => {
  if (isSplitCategorizationEncoded(categorization)) {
    const splits = categorization.entries.map(splitEntryEncoded => ({
      amount: splitEntryEncoded.amount || 0,
      inputValue: formatMoney(splitEntryEncoded.amount),
      category: splitEntryEncoded.category ? new ApiCategorizationAsOption(splitEntryEncoded.category) : null,
      tags: splitEntryEncoded.tags.map(tag => makeTagFromTransactionTag(Schema.decodeSync(TransactionTagSchema)(tag))),
      customerVendor: splitEntryEncoded.customer
        ? decodeCustomerVendor({ ...splitEntryEncoded.customer, customerVendorType: 'CUSTOMER' })
        : splitEntryEncoded.vendor
          ? decodeCustomerVendor({ ...splitEntryEncoded.vendor, customerVendorType: 'VENDOR' })
          : null,
    }))
    return new SplitAsOption(splits)
  }

  return new ApiCategorizationAsOption(categorization)
}

function getLeafCategories(category: NestedCategorization): NestedCategorization[] {
  if (!category.subCategories || category.subCategories.length === 0) {
    return [category]
  }

  return category.subCategories.flatMap(subCategory => getLeafCategories(subCategory))
}

export const flattenCategories = (categories: NestedCategorization[]) => {
  return categories.map((category: NestedCategorization) => ({
    label: category.displayName.toLocaleUpperCase(),
    options: getLeafCategories(category).map(x => new CategoryAsOption(x)),
  }))
}

const hasOnlyTransferMatches = (bankTransaction: BankTransaction) => {
  return bankTransaction.suggested_matches?.every(x => x.details.type === 'Transfer_Match') ?? false
}

export const getSuggestedMatchesGroup = (bankTransaction: BankTransaction) => {
  if (!bankTransaction.suggested_matches || bankTransaction.suggested_matches.length === 0) {
    return null
  }

  return {
    label: hasOnlyTransferMatches(bankTransaction)
      ? BankTransactionCategoryComboBoxGroupLabel.TRANSFER
      : BankTransactionCategoryComboBoxGroupLabel.MATCH,
    options: bankTransaction.suggested_matches.map((match: SuggestedMatch) => new SuggestedMatchAsOption(match)),
  }
}

export const getAllCategoriesGroup = () => {
  return {
    label: BankTransactionCategoryComboBoxGroupLabel.ALL_CATEGORIES,
    options: [new PlaceholderAsOption({ label: '', value: 'ALL_CATEGORIES', isHidden: true })],
  }
}

export const isLoadingSuggestions = (bankTransaction: BankTransaction) => {
  return bankTransaction.categorization_status === CategorizationStatus.PENDING
}
export const getSuggestedCategoriesGroup = (bankTransaction: BankTransaction) => {
  if (isLoadingSuggestions(bankTransaction)) {
    return {
      label: BankTransactionCategoryComboBoxGroupLabel.SUGGESTIONS,
      options: [new PlaceholderAsOption({ label: 'Generating suggestions for transaction...', value: 'LOADING_SUGGESTIONS' })],
    }
  }

  const categorizationFlow = bankTransaction.categorization_flow
  if (categorizationFlow?.type === CategorizationType.ASK_FROM_SUGGESTIONS && hasSuggestions(categorizationFlow)) {
    return {
      label: BankTransactionCategoryComboBoxGroupLabel.SUGGESTIONS,
      options: categorizationFlow.suggestions.map(suggestion => convertCategorizationToOption(suggestion)),
    }
  }

  return null
}

export const getDefaultSelectedCategoryForBankTransaction = (bankTransaction: BankTransaction): BankTransactionCategoryComboBoxOption | null => {
  if (bankTransaction.suggested_matches?.[0]) {
    return new SuggestedMatchAsOption(bankTransaction.suggested_matches[0])
  }

  if (hasSuggestions(bankTransaction.categorization_flow)) {
    return convertCategorizationToOption(bankTransaction.categorization_flow.suggestions[0])
  }

  return null
}
