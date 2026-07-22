import { fromDate, toCalendarDate } from '@internationalized/date'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import type { CategoryUpdate } from '@schemas/bankTransactions/categoryUpdate'
import { isClassificationExclusion } from '@schemas/categorization'
import type { RecordCustomTransaction } from '@schemas/customAccounts'
import { convertCentsToNonRecursiveBigDecimal, convertNonRecursiveBigDecimalToCents } from '@schemas/nonRecursiveBigDecimal'
import { buildCategorizeBankTransactionPayloadForSplit, getDefaultSelectedCategoryForBankTransaction } from '@utils/bankTransactions/shared'
import { getDefaultTaxCodeForBankTransaction } from '@utils/bankTransactions/taxCode'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
import { isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import type { RecordTransactionFormValues, RecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/useRecordTransactionForm'
import { isNewAccountOption } from '@components/CustomAccountComboBox/utils'

type RecordCustomAccountTransactionParams = {
  customAccountId: string
  transaction: RecordCustomTransaction
}

export const convertCategoryOptionToCategoryUpdate = (
  option: BankTransactionNonSuggestedMatchOption | null,
): CategoryUpdate | null => {
  if (option === null) return null
  if (isSplitAsOption(option)) return buildCategorizeBankTransactionPayloadForSplit(option.original)
  return option.classification ? { type: 'Category', category: option.classification } : null
}

export function convertRecordTransactionFormToParams(
  { account, description, amount, date, category, taxCode, memo }: RecordTransactionFormValues,
  variant: RecordTransactionVariant,
): RecordCustomAccountTransactionParams | null {
  if (account === null || isNewAccountOption(account) || amount === null || date === null) return null

  const isExpense = variant === 'expense'

  // The form's tax code field only applies to a single category; split entries carry their own.
  const categorization = category !== null && category.type === 'Category'
    ? { ...category, taxCode: isClassificationExclusion(category.category) ? null : taxCode }
    : category

  return {
    customAccountId: account.value,
    transaction: {
      amount: convertNonRecursiveBigDecimalToCents(amount),
      direction: isExpense ? BankTransactionDirection.Debit : BankTransactionDirection.Credit,
      date: toCalendarDate(date).toString(),
      description: description.trim(),
      memo: memo.trim(),
      ...(categorization !== null && { categorization }),
    },
  }
}

export const getRecordTransactionVariant = ({ direction }: BankTransaction): RecordTransactionVariant =>
  direction === BankTransactionDirection.Debit ? 'expense' : 'income'

export const getRecordTransactionFormValues = (
  transaction: BankTransaction,
): RecordTransactionFormValues => ({
  account: {
    value: transaction.externalAccountId ?? '',
    label: transaction.accountName ?? '',
    account: { accountName: transaction.accountName ?? '' },
  },
  description: transaction.description ?? '',
  amount: convertCentsToNonRecursiveBigDecimal(transaction.amount),
  date: fromDate(transaction.date, 'UTC'),
  category: convertCategoryOptionToCategoryUpdate(getDefaultSelectedCategoryForBankTransaction(transaction)),
  taxCode: getDefaultTaxCodeForBankTransaction(transaction),
  memo: transaction.memo ?? '',
})
