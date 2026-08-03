import { type BankTransaction } from '@internal-types/bankTransactions'
import { getBankTransactionTaxOptions } from '@utils/bankTransactions/taxCode'

export const getBankTransactionsById = (
  bankTransactions?: readonly BankTransaction[],
): Map<string, BankTransaction> => {
  return new Map((bankTransactions ?? []).map(bankTransaction => [bankTransaction.id, bankTransaction]))
}

export const getSelectedBankTransactions = (
  selectedIds: ReadonlySet<string>,
  bankTransactionsById: ReadonlyMap<string, BankTransaction>,
): BankTransaction[] => {
  return Array.from(selectedIds)
    .map(transactionId => bankTransactionsById.get(transactionId))
    .filter((bankTransaction): bankTransaction is BankTransaction => bankTransaction !== undefined)
}

export const getFirstBankTransactionWithTaxOptions = (
  bankTransactions: readonly BankTransaction[],
): BankTransaction | undefined => {
  return bankTransactions.find(bankTransaction => getBankTransactionTaxOptions(bankTransaction).length > 0)
}
