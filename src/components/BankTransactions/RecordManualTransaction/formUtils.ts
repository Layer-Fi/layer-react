import { BankTransactionDirection } from '@schemas/bankTransactions/base'
import type { RecordCustomTransaction } from '@schemas/customAccounts'
import { convertNonRecursiveBigDecimalToCents } from '@schemas/nonRecursiveBigDecimal'
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
