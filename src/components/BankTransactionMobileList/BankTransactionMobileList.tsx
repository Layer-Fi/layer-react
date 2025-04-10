import { BankTransaction } from '../../types'
import { BankTransactionMobileListItem } from './BankTransactionMobileListItem'
import {
  useTransactionToOpen,
  TransactionToOpenContext,
} from './TransactionToOpenContext'

export interface BankTransactionMobileListProps {
  bankTransactions?: BankTransaction[]
  editable: boolean
  removeTransaction: (bt: BankTransaction) => void
  showTooltips: boolean
  showReceiptUploads?: boolean
  showDescriptions?: boolean
}

export const BankTransactionMobileList = ({
  bankTransactions,
  removeTransaction,
  editable,
  showTooltips,
  showReceiptUploads,
  showDescriptions,
}: BankTransactionMobileListProps) => {
  const transactionToOpenContextData = useTransactionToOpen()

  return (
    <TransactionToOpenContext.Provider value={transactionToOpenContextData}>
      <ul className='Layer__bank-transactions__mobile-list'>
        {bankTransactions?.map(
          (bankTransaction: BankTransaction, index: number) => (
            <BankTransactionMobileListItem
              key={bankTransaction.id}
              bankTransaction={bankTransaction}
              showTooltips={showTooltips}
              editable={editable}
              removeTransaction={removeTransaction}
              isFirstItem={index == 0}
              showReceiptUploads={showReceiptUploads}
              showDescriptions={showDescriptions}
            />
          ),
        )}
      </ul>
    </TransactionToOpenContext.Provider>
  )
}
