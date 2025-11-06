import { BankTransaction } from '@internal-types/bank_transactions'
import { BankTransactionsMobileListItem } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItem'
import {
  useTransactionToOpen,
  TransactionToOpenContext,
} from '@components/BankTransactionsMobileList/TransactionToOpenContext'

export interface BankTransactionsMobileListProps {
  bankTransactions?: BankTransaction[]
  editable: boolean
  removeTransaction: (bt: BankTransaction) => void
  initialLoad?: boolean

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BankTransactionsMobileList = ({
  bankTransactions,
  removeTransaction,
  editable,
  initialLoad,

  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsMobileListProps) => {
  const transactionToOpenContextData = useTransactionToOpen()

  return (
    <TransactionToOpenContext.Provider value={transactionToOpenContextData}>
      <ul className='Layer__bank-transactions__mobile-list'>
        {bankTransactions?.map(
          (bankTransaction: BankTransaction, index: number) => (
            <BankTransactionsMobileListItem
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
