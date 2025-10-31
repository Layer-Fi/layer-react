import { BankTransaction, Split } from '../../types/bank_transactions'
import { SplitCategorizationEntryEncoded } from '../../schemas/categorization'
import { decodeCustomerVendor } from '../../features/customerVendor/customerVendorSchemas'
import { BankTransactionCategoryComboBoxOption, isPlaceholderAsOption, isSplitAsOption } from '../BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { makeTagFromTransactionTag, TransactionTagSchema } from '../../features/tags/tagSchemas'
import { Schema } from 'effect/index'
import { convertApiCategorizationToCategoryOrSplitAsOption, getDefaultSelectedCategoryForBankTransaction } from '../BankTransactionCategoryComboBox/utils'
import { isSuggestedMatchAsOption } from '../BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import _ from 'lodash'
import { isApiCategorizationAsOption } from '../BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isSplitCategorizationEncoded } from '../../schemas/categorization'

export enum ValidateSplitError {
  AmountsMustBeGreaterThanZero = 'All splits must have an amount greater than $0.00',
  CategoryIsRequired = 'All splits must have a category',
}

export const isSplitsValid = (localSplits: Split[]): boolean => {
  return validateSplit(localSplits)
    .reduce((acc, splitError) => acc && splitError === undefined, true)
}

export const getSplitsErrorMessage = (localSplits: Split[]): string => {
  return _.uniqBy(validateSplit(localSplits), error => error?.toString()).filter(Boolean)[0] || ''
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
  return _.uniqBy(errors, error => error?.toString())
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
  newSplits[0].amount = remaining

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

export const getLocalSplitStateForExpandedTableRow = (
  selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined,
  bankTransaction: BankTransaction,
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
