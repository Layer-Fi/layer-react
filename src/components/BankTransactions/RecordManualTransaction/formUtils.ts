import { fromDate, toCalendarDate } from '@internationalized/date'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { CategoryAsOption } from '@internal-types/categorizationOption'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import { type Categorization, type Classification, getClassificationFromCategorization, type NestedCategorization } from '@schemas/categorization'
import type { RecordCustomTransaction } from '@schemas/customAccounts'
import { convertCentsToNonRecursiveBigDecimal, convertNonRecursiveBigDecimalToCents } from '@schemas/nonRecursiveBigDecimal'
import { getLeafCategories } from '@utils/categories'
import type { RecordTransactionFormValues, RecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/useRecordTransactionForm'
import { isNewAccountOption } from '@components/CustomAccountComboBox/utils'

type RecordCustomAccountTransactionParams = {
  customAccountId: string
  transaction: RecordCustomTransaction
}

export function convertRecordTransactionFormToParams(
  { account, counterparty, amount, date, category, memo }: RecordTransactionFormValues,
  variant: RecordTransactionVariant,
): RecordCustomAccountTransactionParams | null {
  if (account === null || isNewAccountOption(account) || amount === null || date === null) return null

  const isExpense = variant === 'expense'

  return {
    customAccountId: account.value,
    transaction: {
      amount: convertNonRecursiveBigDecimalToCents(amount),
      direction: isExpense ? BankTransactionDirection.Debit : BankTransactionDirection.Credit,
      date: toCalendarDate(date).toString(),
      description: memo.trim(),
      ...(counterparty !== null && (isExpense ? { vendorId: counterparty.id } : { customerId: counterparty.id })),
      ...(category !== null && { categorization: { type: 'Category' as const, category } }),
    },
  }
}

export const getRecordTransactionVariant = ({ direction }: BankTransaction): RecordTransactionVariant =>
  direction === BankTransactionDirection.Debit ? 'expense' : 'income'

export const matchCategoryClassification = (
  category: Categorization,
  categories: readonly NestedCategorization[] | undefined,
): Classification | null => {
  if (category.type === 'Split_Categorization' || !categories) {
    return getClassificationFromCategorization(category)
  }

  const stableName = category.type === 'Account' ? category.stableName : null

  const leaf = getLeafCategories([...categories]).find((option) => {
    switch (option.type) {
      case 'AccountNested':
        return option.id === category.id || (stableName !== null && option.stableName === stableName)
      case 'OptionalAccountNested':
        return stableName !== null && option.stableName === stableName
      case 'ExclusionNested':
        return option.id === category.id || option.category === category.category
      default:
        return false
    }
  })

  return leaf ? new CategoryAsOption(leaf).classification : getClassificationFromCategorization(category)
}

export const getRecordTransactionFormValues = (
  transaction: BankTransaction,
  categories: readonly NestedCategorization[] | undefined,
): RecordTransactionFormValues => ({
  account: {
    value: transaction.externalAccountId ?? '',
    label: transaction.accountName ?? '',
    account: { accountName: transaction.accountName ?? '' },
  },
  counterparty: (getRecordTransactionVariant(transaction) === 'expense' ? transaction.vendor : transaction.customer) ?? null,
  amount: convertCentsToNonRecursiveBigDecimal(transaction.amount),
  date: fromDate(transaction.date, 'UTC'),
  category: transaction.category !== null && transaction.category !== undefined
    ? matchCategoryClassification(transaction.category, categories)
    : null,
  memo: transaction.description ?? '',
})
