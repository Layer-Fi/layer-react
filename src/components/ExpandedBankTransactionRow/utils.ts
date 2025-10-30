import { ExpandedRowState } from './ExpandedBankTransactionRow'
import { BankTransaction, Split } from '../../types/bank_transactions'
import { centsToDollars as formatMoney } from '../../models/Money'
import { SplitCategorizationEntryEncoded } from '../../schemas/categorization'
import { decodeCustomerVendor } from '../../features/customerVendor/customerVendorSchemas'
import { BankTransactionCategoryComboBoxOption, isPlaceholderAsOption, isSplitAsOption } from '../BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { makeTagFromTransactionTag, TransactionTagSchema } from '../../features/tags/tagSchemas'
import { Schema } from 'effect/index'
import { getDefaultSelectedCategoryForBankTransaction } from '../BankTransactionCategoryComboBox/utils'
import { isSuggestedMatchAsOption } from '../BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export const validateSplit = (expandedRowState: ExpandedRowState): boolean => {
  let valid = true

  expandedRowState.splits.forEach((split) => {
    if (split.amount <= 0) {
      valid = false
    }
    else if (!split.category) {
      valid = false
    }
  })

  return valid
}

export const calculateAddSplit = (
  initialRowState: ExpandedRowState,
): ExpandedRowState => {
  const newSplit = {
    amount: 0,
    inputValue: '0.00',
    category: null,
    tags: [],
    customerVendor: null,
  }

  return {
    ...initialRowState,
    splits: [...initialRowState.splits, newSplit],
  }
}

export const calculateRemoveSplit = (
  initialRowState: ExpandedRowState,
  { totalAmount, index }: { totalAmount: number, index: number }): ExpandedRowState => {
  const newSplits = initialRowState.splits.filter((_v, idx) => idx !== index)
  const splitTotal = newSplits.reduce((sum, split, index) => {
    const splitAmount = index === 0 ? 0 : split.amount
    return sum + splitAmount
  }, 0)
  const remaining = totalAmount - splitTotal
  initialRowState.splits[0].amount = remaining
  initialRowState.splits[0].inputValue = formatMoney(remaining)

  return {
    ...initialRowState,
    splits: newSplits,
  }
}

export const sanitizeNumberInput = (input: string): string => {
  let sanitized = input.replace(/[^0-9.]/g, '')

  // Ensure there's at most one period
  const parts = sanitized.split('.')
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('')
  }

  // Limit to two digits after the decimal point
  if (parts.length === 2) {
    sanitized = parts[0] + '.' + parts[1].slice(0, 2)
  }

  return sanitized
}

export const calculateUpdatedAmounts = (
  initialRowState: ExpandedRowState,
  { index, newAmountInput, totalAmount }: { index: number, newAmountInput: string, totalAmount: number },
): ExpandedRowState => {
  const newDisplaying = sanitizeNumberInput(newAmountInput)
  const newAmount = Number(newAmountInput) * 100 // cents
  const splitTotal = initialRowState.splits.reduce((sum, split, index) => {
    const amount =
        index === 0 ? 0 : index === index ? newAmount : split.amount
    return sum + amount
  }, 0)

  const remaining = totalAmount - splitTotal
  initialRowState.splits[index].amount = newAmount
  initialRowState.splits[index].inputValue = newDisplaying
  initialRowState.splits[0].amount = remaining
  initialRowState.splits[0].inputValue = formatMoney(remaining)

  return {
    ...initialRowState,
    splits: [...initialRowState.splits],
  }
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

  // Split Category
  if (coercedSelectedCategory && isSplitAsOption(coercedSelectedCategory)) {
    return coercedSelectedCategory.original.map((splitEntry) => {
      return {
        amount: splitEntry.amount || 0,
        inputValue: formatMoney(splitEntry.amount),
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
      inputValue: formatMoney(bankTransaction.amount),
      category: coercedSelectedCategory ?? null,
      tags: bankTransaction.transaction_tags.map(tag => makeTagFromTransactionTag(Schema.decodeSync(TransactionTagSchema)(tag))),
      customerVendor: getCustomerVendorForBankTransaction(bankTransaction),
    },
  ]
}
