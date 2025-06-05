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
  initialLoad?: boolean

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BankTransactionMobileList = ({
  bankTransactions,
  removeTransaction,
  editable,
  initialLoad,

  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionMobileListProps) => {
  const transactionToOpenContextData = useTransactionToOpen()

  return (
    <TransactionToOpenContext.Provider value={transactionToOpenContextData}>
      <ul className='Layer__bank-transactions__mobile-list'>
        {bankTransactions?.map(
          (bankTransaction: BankTransaction, index: number) => (
            <BankTransactionMobileListItem
              key={bankTransaction.id}
              index={index}
              bankTransaction={bankTransaction}
              editable={editable}
              removeTransaction={removeTransaction}
              initialLoad={initialLoad}
              isFirstItem={index == 0}

              showDescriptions={showDescriptions}
              showReceiptUploads={showReceiptUploads}
              showTooltips={showTooltips}
            />
          ),
        )}
      </ul>
    </TransactionToOpenContext.Provider>
  )
}
