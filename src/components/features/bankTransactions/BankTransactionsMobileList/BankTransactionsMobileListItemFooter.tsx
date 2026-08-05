import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { isCategorized } from '@utils/features/bankTransactions/shared'
import { useBankTransactionsContext } from '@providers/bankTransactions/BankTransactions/BankTransactionsContext'
import { useBankTransactionsIsCategorizationEnabledContext } from '@providers/categorization/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { BankTransactionsListItemCategory } from '@features/bankTransactions/BankTransactionsListItemCategory/BankTransactionsListItemCategory'
import { BankTransactionsProcessingInfo } from '@features/bankTransactions/BankTransactionsProcessingInfo/BankTransactionsProcessingInfo'

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

  return isCategorizationEnabled || displayAsCategorized
    ? <BankTransactionsListItemCategory bankTransaction={bankTransaction} mobile categorized={displayAsCategorized} />
    : <BankTransactionsProcessingInfo showAsBadge />
}
