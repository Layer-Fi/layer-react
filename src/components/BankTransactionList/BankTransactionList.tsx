import { DATE_FORMAT } from '../../config/general'
import { BankTransaction } from '../../types'
import {
  BankTransactionCTAStringOverrides,
  BankTransactionsMode,
} from '../BankTransactions/BankTransactions'
import { BankTransactionListItem } from './BankTransactionListItem'

interface BankTransactionListProps {
  bankTransactions?: BankTransaction[]
  editable: boolean
  mode: BankTransactionsMode
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
  mode,
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
            index={index}
            key={bankTransaction.id}
            dateFormat={DATE_FORMAT}
            bankTransaction={bankTransaction}
            mode={mode}
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
