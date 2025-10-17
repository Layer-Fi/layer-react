import { DATE_FORMAT } from '../../config/general'
import { BankTransaction } from '../../types/bank_transactions'
import {
  BankTransactionCTAStringOverrides,
} from '../BankTransactions/BankTransactions'
import { BankTransactionListItem } from './BankTransactionListItem'

interface BankTransactionListProps {
  bankTransactions?: BankTransaction[]
  editable: boolean
  containerWidth: number
  removeTransaction: (bt: BankTransaction) => void
  stringOverrides?: BankTransactionCTAStringOverrides

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BankTransactionList = ({
  bankTransactions,
  editable,
  removeTransaction,
  containerWidth,
  stringOverrides,

  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionListProps) => {
  return (
    <ul className='Layer__bank-transactions__list'>
      {bankTransactions?.map(
        (bankTransaction: BankTransaction, index: number) => (
          <BankTransactionListItem
            key={bankTransaction.id}
            index={index}
            dateFormat={DATE_FORMAT}
            bankTransaction={bankTransaction}
            editable={editable}
            removeTransaction={removeTransaction}
            containerWidth={containerWidth}
            stringOverrides={stringOverrides}

            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
            showTooltips={showTooltips}
          />
        ),
      )}
    </ul>
  )
}
