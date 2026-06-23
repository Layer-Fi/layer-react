import { type BankTransaction } from '@internal-types/bankTransactions'
import { isCategorized } from '@utils/bankTransactions/shared'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { BankTransactionsListItemCategory } from '@components/BankTransactions/BankTransactionsListItemCategory/BankTransactionsListItemCategory'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'

export interface BankTransactionsMobileListItemFooterProps {
  bankTransaction: BankTransaction
}

export const BankTransactionsMobileListItemFooter = ({
  bankTransaction,
}: BankTransactionsMobileListItemFooterProps) => {
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  return !isCategorizationEnabled && !isCategorized(bankTransaction)
    ? <BankTransactionsProcessingInfo showAsBadge />
    : <BankTransactionsListItemCategory bankTransaction={bankTransaction} mobile />
}
