import { Direction } from '@internal-types/general'
import type { RawCustomTransaction } from '@schemas/customAccounts'
import { convertNonRecursiveBigDecimalToCents } from '@schemas/nonRecursiveBigDecimal'
import type { RecordTransactionFormValues, RecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/useRecordTransactionForm'
import { isNewAccountOption } from '@components/CustomAccountComboBox/utils'

type CreateCustomAccountTransactionsParams = {
  customAccountId: string
  transactions: RawCustomTransaction[]
}

export function convertRecordTransactionFormToParams(
  { account, amount, date, memo }: RecordTransactionFormValues,
  variant: RecordTransactionVariant,
): CreateCustomAccountTransactionsParams | null {
  if (account === null || isNewAccountOption(account) || amount === null || date === null) return null

  return {
    customAccountId: account.value,
    transactions: [{
      amount: convertNonRecursiveBigDecimalToCents(amount),
      direction: variant === 'expense' ? Direction.DEBIT : Direction.CREDIT,
      date: date.toDate().toISOString(),
      description: memo.trim(),
    }],
  }
}
