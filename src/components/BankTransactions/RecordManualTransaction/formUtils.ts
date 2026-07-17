import { fromDate, toCalendarDate } from '@internationalized/date'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import { getClassificationFromCategorization } from '@schemas/categorization'
import type { RecordCustomTransaction } from '@schemas/customAccounts'
import { convertCentsToNonRecursiveBigDecimal, convertNonRecursiveBigDecimalToCents } from '@schemas/nonRecursiveBigDecimal'
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

export const getRecordTransactionFormValues = (transaction: BankTransaction): RecordTransactionFormValues => ({
  account: {
    value: transaction.sourceAccountId ?? '',
    label: transaction.accountName ?? '',
    account: { accountName: transaction.accountName ?? '' },
  },
  counterparty: transaction.customer ?? transaction.vendor ?? null,
  amount: convertCentsToNonRecursiveBigDecimal(transaction.amount),
  date: fromDate(transaction.date, 'UTC'),
  category: transaction.category !== null && transaction.category !== undefined
    ? getClassificationFromCategorization(transaction.category)
    : null,
  memo: transaction.description ?? '',
})
