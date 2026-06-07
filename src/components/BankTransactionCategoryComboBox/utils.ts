import type { TFunction } from 'i18next'

import type { BankTransaction, SuggestedMatch } from '@internal-types/bankTransactions'
import { ApiCategorizationAsOption, CategoryAsOption, PlaceholderAsOption, SplitAsOption, SuggestedMatchAsOption } from '@internal-types/categorizationOption'
import { CategorizationStatus, InputStrategy } from '@schemas/bankTransactions/bankTransaction'
import { type Categorization, isSplitCategorization, type NestedCategorization } from '@schemas/categorization'
import { makeCustomerVendor } from '@schemas/customerVendor'
import { makeTagFromTransactionTag } from '@schemas/tag'
import { translationKey } from '@utils/i18n/translationKey'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'

export enum BankTransactionCategoryComboBoxGroup {
  TRANSFER = 'TRANSFER',
  MATCH = 'MATCH',
  SUGGESTIONS = 'SUGGESTIONS',
  ALL_CATEGORIES = 'ALL_CATEGORIES',
}

const GROUP_LABEL_I18N: Record<BankTransactionCategoryComboBoxGroup, { i18nKey: string, defaultValue: string }> = {
  [BankTransactionCategoryComboBoxGroup.TRANSFER]: translationKey('bankTransactions:label.transfer_uppercase', 'TRANSFER'),
  [BankTransactionCategoryComboBoxGroup.MATCH]: translationKey('bankTransactions:label.match_uppercase', 'MATCH'),
  [BankTransactionCategoryComboBoxGroup.SUGGESTIONS]: translationKey('bankTransactions:label.suggestions_uppercase', 'SUGGESTIONS'),
  [BankTransactionCategoryComboBoxGroup.ALL_CATEGORIES]: translationKey('bankTransactions:label.all_categories_uppercase', 'ALL CATEGORIES'),
}

const BOLD_GROUP_LABELS = new Set<BankTransactionCategoryComboBoxGroup>([
  BankTransactionCategoryComboBoxGroup.ALL_CATEGORIES,
  BankTransactionCategoryComboBoxGroup.TRANSFER,
  BankTransactionCategoryComboBoxGroup.MATCH,
])

export const getGroupDisplayLabel = (label: string | undefined, t: TFunction): string | undefined => {
  if (!label) return undefined
  const config = label in GROUP_LABEL_I18N ? GROUP_LABEL_I18N[label as BankTransactionCategoryComboBoxGroup] : undefined
  return config ? t(config.i18nKey, config.defaultValue) : label
}

export const isBoldGroupLabel = (label: string | undefined): boolean =>
  label !== undefined && BOLD_GROUP_LABELS.has(label as BankTransactionCategoryComboBoxGroup)

export const convertApiCategorizationToCategoryOrSplitAsOption = (categorization: Categorization): BankTransactionNonSuggestedMatchOption => {
  if (isSplitCategorization(categorization)) {
    const splits = categorization.entries.map(splitEntry => ({
      amount: splitEntry.amount || 0,
      category: splitEntry.category ? new ApiCategorizationAsOption(splitEntry.category) : null,
      taxCode: splitEntry.taxCode ?? null,
      tags: splitEntry.tags?.map(makeTagFromTransactionTag) ?? [],
      customerVendor: makeCustomerVendor(splitEntry.customer, splitEntry.vendor),
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
  return bankTransaction.suggestedMatches?.every(x => x.details.type === 'Transfer_Match') ?? false
}

export const getSuggestedMatchesGroup = (bankTransaction: BankTransaction) => {
  if (!bankTransaction.suggestedMatches || bankTransaction.suggestedMatches.length === 0) {
    return null
  }

  return {
    label: hasOnlyTransferMatches(bankTransaction)
      ? BankTransactionCategoryComboBoxGroup.TRANSFER
      : BankTransactionCategoryComboBoxGroup.MATCH,
    options: bankTransaction.suggestedMatches.map((match: SuggestedMatch) => new SuggestedMatchAsOption(match)),
  }
}

export const getAllCategoriesGroup = () => {
  return {
    label: BankTransactionCategoryComboBoxGroup.ALL_CATEGORIES,
    options: [new PlaceholderAsOption({ label: '', value: 'ALL_CATEGORIES', isHidden: true })],
  }
}

export const isLoadingSuggestions = (bankTransaction: BankTransaction) => {
  return bankTransaction.categorizationStatus === CategorizationStatus.PENDING
}
export const getSuggestedCategoriesGroup = (bankTransaction: BankTransaction, t: TFunction) => {
  if (isLoadingSuggestions(bankTransaction)) {
    return {
      label: BankTransactionCategoryComboBoxGroup.SUGGESTIONS,
      options: [new PlaceholderAsOption({ label: t('bankTransactions:label.generating_suggestions_transaction', 'Generating suggestions for transaction...'), value: 'LOADING_SUGGESTIONS' })],
    }
  }

  const categorizationFlow = bankTransaction.categorizationFlow
  if (categorizationFlow?.type === InputStrategy.AskFromSuggestions && categorizationFlow.suggestions.length > 0) {
    return {
      label: BankTransactionCategoryComboBoxGroup.SUGGESTIONS,
      options: categorizationFlow.suggestions.map(convertApiCategorizationToCategoryOrSplitAsOption),
    }
  }

  return null
}
