import { Schema } from 'effect/index'
import type { TFunction } from 'i18next'
import { uniqBy } from 'lodash-es'

import { type BankTransaction, type Split } from '@internal-types/bankTransactions'
import { type SplitCategorizationEntryEncoded } from '@schemas/categorization'
import { isSplitCategorizationEncoded } from '@schemas/categorization'
import { decodeCustomerVendor } from '@schemas/customerVendor'
import { makeTagFromTransactionTag, TransactionTagSchema } from '@schemas/tag'
import { toLocalizedCents } from '@utils/i18n/number/input'
import { type BankTransactionCategoryComboBoxOption, isPlaceholderAsOption, isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isApiCategorizationAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { convertApiCategorizationToCategoryOrSplitAsOption, getDefaultSelectedCategoryForBankTransaction } from '@components/BankTransactionCategoryComboBox/utils'

export enum ValidateSplitError {
  AmountsMustBeGreaterThanZero = 'AmountsMustBeGreaterThanZero',
  CategoryIsRequired = 'CategoryIsRequired',
}

const getValidateSplitErrorMessage = (splitError: ValidateSplitError, t: TFunction): string => {
  switch (splitError) {
    case ValidateSplitError.AmountsMustBeGreaterThanZero:
      return t('bankTransactions:validation.splits_amount_greater_than_zero', 'All splits must have an amount greater than $0.00')
    case ValidateSplitError.CategoryIsRequired:
      return t('bankTransactions:validation.splits_must_have_category', 'All splits must have a category')
  }
}

export const isSplitsValid = (localSplits: Split[]): boolean => {
  return validateSplit(localSplits)
    .reduce((acc, splitError) => acc && splitError === undefined, true)
}

export const getSplitsErrorMessage = (localSplits: Split[], t: TFunction): string => {
  const firstError = uniqBy(validateSplit(localSplits), error => error?.toString()).find((error): error is ValidateSplitError => error !== undefined)
  if (!firstError) return ''
  return getValidateSplitErrorMessage(firstError, t)
}

export const validateSplit = (localSplits: Split[]): (ValidateSplitError | undefined)[] => {
  const errors = localSplits.map((split) => {
    if (split.amount <= 0) {
      return ValidateSplitError.AmountsMustBeGreaterThanZero
    }

    if (!split.category) {
      return ValidateSplitError.CategoryIsRequired
    }

    return undefined
  })
  return uniqBy(errors, error => error?.toString())
}

export const calculateAddSplit = (
  initialRowSplits: Split[],
): Split[] => {
  const newSplit = {
    amount: 0,
    category: null,
    taxCode: null,
    tags: [],
    customerVendor: null,
  }
  return [...initialRowSplits, newSplit]
}

export const calculateRemoveSplit = (
  initialRowSplits: Split[],
  { totalAmount, index }: { totalAmount: number, index: number }): Split[] => {
  const newSplits = initialRowSplits.filter((_v, idx) => idx !== index)
  const splitTotal = newSplits.reduce((sum, split, index) => {
    const splitAmount = index === 0 ? 0 : split.amount
    return sum + splitAmount
  }, 0)
  const remaining = totalAmount - splitTotal
  newSplits[0].amount = remaining

  return newSplits
}

export const calculateUpdatedAmounts = (
  initialRowSplits: Split[],
  { index, newAmountInput, totalAmount, locale }: { index: number, newAmountInput: string, totalAmount: number, locale: string },
): Split[] => {
  const newAmount = toLocalizedCents(newAmountInput, locale) ?? 0
  const splitTotal = initialRowSplits.reduce((sum, split, idx) => {
    const amount = idx === 0 ? 0 : idx === index ? newAmount : split.amount
    return sum + amount
  }, 0)

  const remaining = totalAmount - splitTotal

  initialRowSplits[index].amount = newAmount
  initialRowSplits[0].amount = remaining

  return [...initialRowSplits]
}

export const getCustomerVendorForSplitEntry = (splitEntry: SplitCategorizationEntryEncoded) => {
  return splitEntry.customer
    ? decodeCustomerVendor({ ...splitEntry.customer, customerVendorType: 'CUSTOMER' })
    : splitEntry.vendor
      ? decodeCustomerVendor({ ...splitEntry.vendor, customerVendorType: 'VENDOR' })
      : null
}

export const getCustomerVendorForBankTransaction = (bankTransaction: BankTransaction) => {
  return bankTransaction.customer
    ? decodeCustomerVendor({ ...bankTransaction.customer, customerVendorType: 'CUSTOMER' })
    : bankTransaction.vendor
      ? decodeCustomerVendor({ ...bankTransaction.vendor, customerVendorType: 'VENDOR' })
      : null
}

export const getLocalSplitStateForExpandedTransaction = (
  bankTransaction: BankTransaction,
  selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined,
): Split[] => {
  let coercedSelectedCategory = selectedCategory
  if (!selectedCategory || isPlaceholderAsOption(selectedCategory)) {
    coercedSelectedCategory = null
  }

  else if (isSuggestedMatchAsOption(selectedCategory)) {
    coercedSelectedCategory = getDefaultSelectedCategoryForBankTransaction(bankTransaction, true)
  }

  else if (isApiCategorizationAsOption(selectedCategory) && isSplitCategorizationEncoded(selectedCategory.original)) {
    coercedSelectedCategory = convertApiCategorizationToCategoryOrSplitAsOption(selectedCategory.original)
  }

  // Split Category
  if (coercedSelectedCategory && isSplitAsOption(coercedSelectedCategory)) {
    return coercedSelectedCategory.original.map((splitEntry) => {
      return {
        amount: splitEntry.amount || 0,
        category: splitEntry.category,
        taxCode: splitEntry.category?.classification?.type === 'Exclusion'
          ? null
          : splitEntry.taxCode ?? null,
        tags: splitEntry.tags,
        customerVendor: splitEntry.customerVendor,
      }
    })
  }
  // Single category
  return [
    {
      amount: bankTransaction.amount,
      category: coercedSelectedCategory ?? null,
      taxCode: coercedSelectedCategory?.classification?.type === 'Exclusion'
        ? null
        : bankTransaction.tax_code ?? null,
      tags: bankTransaction.transaction_tags.map(tag => makeTagFromTransactionTag(Schema.decodeSync(TransactionTagSchema)(tag))),
      customerVendor: getCustomerVendorForBankTransaction(bankTransaction),
    },
  ]
}
