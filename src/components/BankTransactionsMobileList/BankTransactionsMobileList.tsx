import { useState, useEffect } from 'react'
import { BankTransaction } from '../../types/bank_transactions'
import { BankTransactionsMobileListItem } from './BankTransactionsMobileListItem'
import {
  useTransactionToOpen,
  TransactionToOpenContext,
} from './TransactionToOpenContext'
import { BankTransactionsMobileBulkActionsHeader } from './BankTransactionsMobileBulkActionsHeader'
import { useBulkSelectionActions } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'

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
  const [bulkActionsEnabled, setBulkActionsEnabled] = useState(false)
  const { clearSelection } = useBulkSelectionActions()

  useEffect(() => {
    if (!bulkActionsEnabled) {
      clearSelection()
    }
  }, [bulkActionsEnabled, clearSelection])

  return (
    <TransactionToOpenContext.Provider value={transactionToOpenContextData}>
      <BankTransactionsMobileBulkActionsHeader
        bankTransactions={bankTransactions}
        bulkActionsEnabled={bulkActionsEnabled}
        onBulkActionsToggle={setBulkActionsEnabled}
      />
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
              bulkActionsEnabled={bulkActionsEnabled}

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
