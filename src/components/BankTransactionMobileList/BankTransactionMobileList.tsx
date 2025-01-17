import { BankTransaction } from '../../types'
import { BankTransactionsMode } from '../BankTransactions/BankTransactions'
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
  showTooltips: boolean
  mode: BankTransactionsMode
  showReceiptUploads?: boolean
  showDescriptions?: boolean
}

export const BankTransactionMobileList = ({
  bankTransactions,
  removeTransaction,
  editable,
  initialLoad,
  showTooltips,
  mode,
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
              index={index}
              mode={mode}
              key={bankTransaction.id}
              bankTransaction={bankTransaction}
              showTooltips={showTooltips}
              editable={editable}
              removeTransaction={removeTransaction}
              initialLoad={initialLoad}
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
