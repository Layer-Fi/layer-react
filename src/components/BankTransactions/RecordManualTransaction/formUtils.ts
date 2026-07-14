import { formatISO } from 'date-fns'

import { Direction } from '@internal-types/general'
import type { RawCustomTransaction } from '@schemas/customAccounts'
import type { Customer } from '@schemas/customer'
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
      date: formatISO(date.toDate()),
      description: memo.trim(),
    }],
  }
}

export function convertRecordTransactionFormToMetadataParams(
  { counterparty }: RecordTransactionFormValues,
  variant: RecordTransactionVariant,
  bankTransactionId: string,
) {
  return {
    bankTransactionId,
    customer: variant === 'income' ? counterparty as Customer | null : null,
    vendor: variant === 'expense' ? counterparty : null,
  }
}
