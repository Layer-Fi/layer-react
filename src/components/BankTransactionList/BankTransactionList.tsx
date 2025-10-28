import { useMemo, useCallback, useEffect } from 'react'
import { DATE_FORMAT } from '../../config/general'
import { BankTransaction } from '../../types/bank_transactions'
import {
  BankTransactionCTAStringOverrides,
} from '../BankTransactions/BankTransactions'
import { BankTransactionListItem } from './BankTransactionListItem'
import { Checkbox } from '../ui/Checkbox/Checkbox'
import { useSelectedIds, useBulkSelectionActions } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { getDefaultSelectedCategoryForBankTransaction } from '../BankTransactionCategoryComboBox/utils'
import { useBankTransactionsCategoryActions } from '../../providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { Span } from '../ui/Typography/Text'
import { HStack } from '../ui/Stack/Stack'

interface BankTransactionListProps {
  bankTransactions?: BankTransaction[]
  editable: boolean
  containerWidth: number
  removeTransaction: (bt: BankTransaction) => void
  stringOverrides?: BankTransactionCTAStringOverrides

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
  _showBulkSelection?: boolean
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
  _showBulkSelection = false,
}: BankTransactionListProps) => {
  const { selectedIds } = useSelectedIds()
  const { selectMultiple, deselectMultiple } = useBulkSelectionActions()
  const { setOnlyNewTransactionCategories } = useBankTransactionsCategoryActions()

  const currentPageIds = useMemo(
    () => bankTransactions?.map(tx => tx.id) ?? [],
    [bankTransactions],
  )

  const selectedCount = useMemo(
    () => currentPageIds.filter(id => selectedIds.has(id)).length,
    [currentPageIds, selectedIds],
  )

  const isAllSelected = selectedCount > 0 && selectedCount === currentPageIds.length
  const isPartiallySelected = selectedCount > 0 && selectedCount < currentPageIds.length

  const handleHeaderCheckboxChange = useCallback((checked: boolean) => {
    if (!checked || isPartiallySelected) {
      deselectMultiple(currentPageIds)
    }
    else {
      selectMultiple(currentPageIds)
    }
  }, [
    currentPageIds,
    isPartiallySelected,
    selectMultiple,
    deselectMultiple,
  ])

  useEffect(() => {
    if (!bankTransactions) return

    const defaultCategories = bankTransactions.map(transaction => ({
      id: transaction.id,
      category: getDefaultSelectedCategoryForBankTransaction(transaction),
    }))

    setOnlyNewTransactionCategories(defaultCategories)
  }, [bankTransactions, setOnlyNewTransactionCategories])

  return (
    <>
      {_showBulkSelection && (
        <HStack
          gap='md'
          pi='md'
          pb='md'
          className='Layer__bank-transactions__list-header'
        >
          <Checkbox
            isSelected={isAllSelected}
            isIndeterminate={isPartiallySelected}
            onChange={handleHeaderCheckboxChange}
            aria-label='Select all transactions on this page'
          />
          <Span size='sm' pbs='3xs'>
            Select all
          </Span>
        </HStack>
      )}
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
              _showBulkSelection={_showBulkSelection}
            />
          ),
        )}
      </ul>
    </>
  )
}
