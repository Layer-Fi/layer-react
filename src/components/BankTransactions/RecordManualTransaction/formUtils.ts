import { fromDate, getLocalTimeZone } from '@internationalized/date'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { makeAccountId, makeStableName } from '@schemas/accountIdentifier'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import type { Categorization, Classification } from '@schemas/categorization'
import { makeExclusion } from '@schemas/categorization'
import type { RecordCustomTransaction } from '@schemas/customAccounts'
import { convertCentsToNonRecursiveBigDecimal, convertNonRecursiveBigDecimalToCents } from '@schemas/nonRecursiveBigDecimal'
import { toLocalDateString } from '@utils/time/timeUtils'
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
      date: toLocalDateString(date.toDate()),
      description: memo.trim(),
      ...(counterparty !== null && (isExpense ? { vendorId: counterparty.id } : { customerId: counterparty.id })),
      ...(category !== null && { categorization: { type: 'Category' as const, category } }),
    },
  }
}

export const getRecordTransactionVariant = ({ direction }: BankTransaction): RecordTransactionVariant =>
  direction === BankTransactionDirection.Debit ? 'expense' : 'income'

const getClassificationFromCategorization = (categorization: Categorization): Classification | null => {
  switch (categorization.type) {
    case 'Account':
      return categorization.stableName !== null
        ? makeStableName(categorization.stableName)
        : makeAccountId(categorization.id)
    case 'Exclusion':
      return makeExclusion(categorization.category)
    default:
      return null
  }
}

export const getRecordTransactionFormValues = (transaction: BankTransaction): RecordTransactionFormValues => ({
  account: {
    value: transaction.sourceAccountId ?? '',
    label: transaction.accountName ?? '',
    account: { accountName: transaction.accountName ?? '' },
  },
  counterparty: transaction.customer ?? transaction.vendor ?? null,
  amount: convertCentsToNonRecursiveBigDecimal(transaction.amount),
  date: fromDate(transaction.date, getLocalTimeZone()),
  category: transaction.category !== null && transaction.category !== undefined
    ? getClassificationFromCategorization(transaction.category)
    : null,
  memo: transaction.description ?? '',
})
