import { Schema } from 'effect/index'
import { uniqBy } from 'lodash-es'

import { type BankTransaction, type Split } from '@internal-types/bank_transactions'
import { type SplitCategorizationEntryEncoded } from '@schemas/categorization'
import { isSplitCategorizationEncoded } from '@schemas/categorization'
import { type BankTransactionCategoryComboBoxOption, isPlaceholderAsOption, isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isApiCategorizationAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { convertApiCategorizationToCategoryOrSplitAsOption, getDefaultSelectedCategoryForBankTransaction } from '@components/BankTransactionCategoryComboBox/utils'
import { decodeCustomerVendor } from '@features/customerVendor/customerVendorSchemas'
import { makeTagFromTransactionTag, TransactionTagSchema } from '@features/tags/tagSchemas'

export enum ValidateSplitError {
  AmountsMustBeGreaterThanZero = 'All splits must have an amount greater than $0.00',
  CategoryIsRequired = 'All splits must have a category',
}

export const isSplitsValid = (localSplits: Split[]): boolean => {
  return validateSplit(localSplits)
    .reduce((acc, splitError) => acc && splitError === undefined, true)
}

export const getSplitsErrorMessage = (localSplits: Split[]): string => {
  return uniqBy(validateSplit(localSplits), error => error?.toString()).filter(Boolean)[0] || ''
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
  const firstSplit = newSplits[0]
  if (firstSplit) {
    firstSplit.amount = remaining
  }

  return newSplits
}

export const calculateUpdatedAmounts = (
  initialRowSplits: Split[],
  { index, newAmountInput, totalAmount }: { index: number, newAmountInput: string, totalAmount: number },
): Split[] => {
  const newAmount = Number(newAmountInput) * 100
  const splitTotal = initialRowSplits.reduce((sum, split, idx) => {
    const amount = idx === 0 ? 0 : idx === index ? newAmount : split.amount
    return sum + amount
  }, 0)

  const remaining = totalAmount - splitTotal

  const splitAtIndex = initialRowSplits[index]
  if (splitAtIndex) {
    splitAtIndex.amount = newAmount
  }
  const firstSplit = initialRowSplits[0]
  if (firstSplit) {
    firstSplit.amount = remaining
  }

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
      tags: bankTransaction.transaction_tags.map(tag => makeTagFromTransactionTag(Schema.decodeSync(TransactionTagSchema)(tag))),
      customerVendor: getCustomerVendorForBankTransaction(bankTransaction),
    },
  ]
}
