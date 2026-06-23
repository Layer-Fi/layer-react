import { type BankTransaction } from '@internal-types/bankTransactions'
import { isCategorized } from '@utils/bankTransactions/shared'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { AnimatedPresenceElement } from '@ui/AnimatedPresenceElement/AnimatedPresenceElement'
import { BankTransactionsListItemCategory } from '@components/BankTransactions/BankTransactionsListItemCategory/BankTransactionsListItemCategory'
import { BankTransactionsProcessingInfo } from '@components/BankTransactionsList/BankTransactionsProcessingInfo'

export interface BankTransactionsMobileListItemFooterProps {
  bankTransaction: BankTransaction
  isExpanded: boolean
}

export const BankTransactionsMobileListItemFooter = ({
  bankTransaction,
  isExpanded,
}: BankTransactionsMobileListItemFooterProps) => {
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  const { shouldHideAfterCategorize } = useBankTransactionsContext()

  const isBeingRemoved = Boolean(bankTransaction.recentlyCategorized && shouldHideAfterCategorize)
  const displayAsCategorized = isBeingRemoved ? false : isCategorized(bankTransaction)

  return (
    <AnimatedPresenceElement
      variant='fade'
      isOpen={!isExpanded && !isBeingRemoved}
      motionKey={`${bankTransaction.id}--footer`}
    >
      {!isCategorizationEnabled && !displayAsCategorized
        ? <BankTransactionsProcessingInfo showAsBadge />
        : <BankTransactionsListItemCategory bankTransaction={bankTransaction} mobile />}
    </AnimatedPresenceElement>
  )
}
