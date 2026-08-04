import { fromDate, toCalendarDate } from '@internationalized/date'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import { isClassificationExclusion } from '@schemas/categorization/categorization'
import { convertCentsToNonRecursiveBigDecimal, convertNonRecursiveBigDecimalToCents } from '@schemas/common/nonRecursiveBigDecimal'
import type { RecordCustomTransaction } from '@schemas/customAccounts/recordCustomTransaction'
import { getDefaultSelectedCategoryForBankTransaction } from '@utils/bankTransactions/shared'
import { getDefaultTaxCodeForBankTransaction } from '@utils/bankTransactions/taxCode'
import type { RecordBankTransactionFormValues, RecordBankTransactionVariant } from '@features/bankTransactions/RecordBankTransactionForm/useRecordBankTransactionForm'
import { isNewAccountOption } from '@features/customAccounts/CustomAccountComboBox/utils'

type RecordCustomAccountTransactionParams = {
  customAccountId: string
  transaction: RecordCustomTransaction
}

export function convertRecordBankTransactionFormToParams(
  { account, description, amount, date, category, taxCode, memo }: RecordBankTransactionFormValues,
  variant: RecordBankTransactionVariant,
): RecordCustomAccountTransactionParams | null {
  if (account === null || isNewAccountOption(account) || amount === null || date === null) return null

  const isExpense = variant === 'expense'

  return {
    customAccountId: account.value,
    transaction: {
      amount: convertNonRecursiveBigDecimalToCents(amount),
      direction: isExpense ? BankTransactionDirection.Debit : BankTransactionDirection.Credit,
      date: date.toString(),
      description: description.trim(),
      memo: memo.trim(),
      ...(category !== null && { categorization: { type: 'Category' as const, category, taxCode: isClassificationExclusion(category) ? null : taxCode } }),
    },
  }
}

export const getRecordBankTransactionVariant = ({ direction }: BankTransaction): RecordBankTransactionVariant =>
  direction === BankTransactionDirection.Debit ? 'expense' : 'income'

export const getRecordBankTransactionFormValues = (
  transaction: BankTransaction,
): RecordBankTransactionFormValues => ({
  account: {
    value: transaction.externalAccountId ?? '',
    label: transaction.accountName ?? '',
    account: { accountName: transaction.accountName ?? '' },
  },
  description: transaction.description ?? '',
  amount: convertCentsToNonRecursiveBigDecimal(transaction.amount),
  date: toCalendarDate(fromDate(transaction.date, 'UTC')),
  category: getDefaultSelectedCategoryForBankTransaction(transaction)?.classification ?? null,
  taxCode: getDefaultTaxCodeForBankTransaction(transaction),
  memo: transaction.memo ?? '',
})
