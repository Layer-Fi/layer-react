import { Schema } from 'effect/index'
import type { TFunction } from 'i18next'

import type { BankTransaction, SuggestedMatch } from '@internal-types/bankTransactions'
import { CategorizationType, hasSuggestions } from '@internal-types/categories'
import { ApiCategorizationAsOption, CategoryAsOption, PlaceholderAsOption, SplitAsOption, SuggestedMatchAsOption } from '@internal-types/categorizationOption'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { type CategorizationEncoded, isSplitCategorizationEncoded, type NestedCategorization } from '@schemas/categorization'
import { decodeCustomerVendor } from '@schemas/customerVendor'
import { TransactionTagSchema } from '@schemas/tag'
import { makeTagFromTransactionTag } from '@schemas/tag'
import { translationKey } from '@utils/i18n/translationKey'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export enum BankTransactionCategoryComboBoxGroup {
  TRANSFER = 'TRANSFER',
  MATCH = 'MATCH',
  SUGGESTIONS = 'SUGGESTIONS',
  ALL_CATEGORIES = 'ALL_CATEGORIES',
}

const GROUP_LABEL_I18N: Record<BankTransactionCategoryComboBoxGroup, { i18nKey: string, defaultValue: string }> = {
  [BankTransactionCategoryComboBoxGroup.TRANSFER]: translationKey('bankTransactions.transferUppercase', 'TRANSFER'),
  [BankTransactionCategoryComboBoxGroup.MATCH]: translationKey('bankTransactions.matchUppercase', 'MATCH'),
  [BankTransactionCategoryComboBoxGroup.SUGGESTIONS]: translationKey('bankTransactions.suggestionsUppercase', 'SUGGESTIONS'),
  [BankTransactionCategoryComboBoxGroup.ALL_CATEGORIES]: translationKey('bankTransactions.allCategoriesUppercase', 'ALL CATEGORIES'),
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

export const convertApiCategorizationToCategoryOrSplitAsOption = (categorization: CategorizationEncoded): BankTransactionCategoryComboBoxOption => {
  if (isSplitCategorizationEncoded(categorization)) {
    const splits = categorization.entries.map(splitEntryEncoded => ({
      amount: splitEntryEncoded.amount || 0,
      category: splitEntryEncoded.category ? new ApiCategorizationAsOption(splitEntryEncoded.category) : null,
      tags: splitEntryEncoded.tags?.map(tag => makeTagFromTransactionTag(Schema.decodeSync(TransactionTagSchema)(tag))) ?? [],
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
      ? BankTransactionCategoryComboBoxGroup.TRANSFER
      : BankTransactionCategoryComboBoxGroup.MATCH,
    options: bankTransaction.suggested_matches.map((match: SuggestedMatch) => new SuggestedMatchAsOption(match)),
  }
}

export const getAllCategoriesGroup = () => {
  return {
    label: BankTransactionCategoryComboBoxGroup.ALL_CATEGORIES,
    options: [new PlaceholderAsOption({ label: '', value: 'ALL_CATEGORIES', isHidden: true })],
  }
}

export const isLoadingSuggestions = (bankTransaction: BankTransaction) => {
  return bankTransaction.categorization_status === CategorizationStatus.PENDING
}
export const getSuggestedCategoriesGroup = (bankTransaction: BankTransaction, t: TFunction) => {
  if (isLoadingSuggestions(bankTransaction)) {
    return {
      label: BankTransactionCategoryComboBoxGroup.SUGGESTIONS,
      options: [new PlaceholderAsOption({ label: t('bankTransactions.generatingSuggestionsForTransaction', 'Generating suggestions for transaction...'), value: 'LOADING_SUGGESTIONS' })],
    }
  }

  const categorizationFlow = bankTransaction.categorization_flow
  if (categorizationFlow?.type === CategorizationType.ASK_FROM_SUGGESTIONS && hasSuggestions(categorizationFlow)) {
    return {
      label: BankTransactionCategoryComboBoxGroup.SUGGESTIONS,
      options: categorizationFlow.suggestions.map(suggestion => convertApiCategorizationToCategoryOrSplitAsOption(suggestion)),
    }
  }

  return null
}

export const getDefaultSelectedCategoryForBankTransaction = (
  bankTransaction: BankTransaction,
  ignoreSuggestedMatches = false,
): BankTransactionCategoryComboBoxOption | null => {
  if (bankTransaction.category) {
    return convertApiCategorizationToCategoryOrSplitAsOption(bankTransaction.category)
  }

  if (!ignoreSuggestedMatches && bankTransaction.suggested_matches?.[0]) {
    return new SuggestedMatchAsOption(bankTransaction.suggested_matches[0])
  }

  if (hasSuggestions(bankTransaction.categorization_flow)) {
    return convertApiCategorizationToCategoryOrSplitAsOption(bankTransaction.categorization_flow.suggestions[0])
  }

  return null
}
