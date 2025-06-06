import { DATE_FORMAT } from '../../config/general'
import { BankTransaction } from '../../types'
import {
  BankTransactionCTAStringOverrides,
} from '../BankTransactions/BankTransactions'
import { BankTransactionListItem } from './BankTransactionListItem'

interface BankTransactionListProps {
  bankTransactions?: BankTransaction[]
  editable: boolean
  containerWidth: number
  removeTransaction: (bt: BankTransaction) => void
  showDescriptions?: boolean
  showReceiptUploads?: boolean
  showTooltips: boolean
  stringOverrides?: BankTransactionCTAStringOverrides
}

export const BankTransactionList = ({
  bankTransactions,
  editable,
  removeTransaction,
  containerWidth,
  showDescriptions = false,
  showReceiptUploads = false,
  showTooltips,
  stringOverrides,
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
            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
            showTooltips={showTooltips}
            stringOverrides={stringOverrides}
          />
        ),
      )}
    </ul>
  )
}
