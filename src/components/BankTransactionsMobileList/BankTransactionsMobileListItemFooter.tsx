import { type BankTransaction } from '@internal-types/bankTransactions'
import { isCategorized } from '@utils/bankTransactions/shared'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
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
  const { shouldHideAfterCategorize } = useBankTransactionsContext()

  const isBeingRemoved = bankTransaction.recentlyCategorized && shouldHideAfterCategorize
  const displayAsCategorized = isBeingRemoved ? false : isCategorized(bankTransaction)

  return !isCategorizationEnabled && !displayAsCategorized
    ? <BankTransactionsProcessingInfo showAsBadge />
    : <BankTransactionsListItemCategory bankTransaction={bankTransaction} mobile categorized={displayAsCategorized} />
}
