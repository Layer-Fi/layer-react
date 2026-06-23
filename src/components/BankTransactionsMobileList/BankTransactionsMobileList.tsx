import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
import { useBulkSelectionActions } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useMobileListBulkSelection } from '@providers/BulkSelectionStore/useMobileListBulkSelection'
import { MobileList } from '@ui/MobileList/MobileList'
import { useMobileListExpansion } from '@ui/MobileList/useMobileListExpansion'
import { BankTransactionsMobileBulkActionsHeader } from '@components/BankTransactionsMobileList/BankTransactionsMobileBulkActionsHeader'
import { BankTransactionsMobileListItem } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItem'
import { BankTransactionsMobileListItemExpandedRow } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemExpandedRow'
import { BankTransactionsMobileListItemFooter } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemFooter'

import './bankTransactionsMobileList.scss'

export interface BankTransactionsMobileListProps {
  bankTransactions?: BankTransaction[]
  initialLoad?: boolean

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

const EmptyState = () => null
const ErrorState = () => null
const LIST_SLOTS = { EmptyState, ErrorState }

export const BankTransactionsMobileList = ({
  bankTransactions,
  initialLoad,
  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsMobileListProps) => {
  const { t } = useTranslation()
  const [bulkActionsEnabled, setBulkActionsEnabled] = useState(false)

  const { clearSelection } = useBulkSelectionActions()
  useUpsertBankTransactionsDefaultCategories(bankTransactions)

  const orderedIds = useMemo(
    () => bankTransactions?.map(tx => tx.id) ?? [],
    [bankTransactions],
  )

  const bulkSelectionProps = useMobileListBulkSelection(orderedIds, { enabled: bulkActionsEnabled })

  const { expandedKeys, open, close, toggle, closeAll, openNext } =
    useMobileListExpansion(orderedIds, {
      defaultExpandedIds: orderedIds[0] ? [orderedIds[0]] : undefined,
    })

  useEffect(() => {
    if (!bulkActionsEnabled) {
      clearSelection()
    }
  }, [bulkActionsEnabled, clearSelection])

  useEffect(() => {
    if (bulkActionsEnabled) {
      closeAll()
    }
    else if (orderedIds[0]) {
      open(orderedIds[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulkActionsEnabled])

  const onClickItem = useCallback(
    (bankTransaction: BankTransaction) => toggle(bankTransaction.id),
    [toggle],
  )

  const renderItem = useCallback(
    (bankTransaction: BankTransaction) => {
      const index = orderedIds.indexOf(bankTransaction.id)
      return (
        <BankTransactionsMobileListItem
          index={index < 0 ? 0 : index}
          bankTransaction={bankTransaction}
          initialLoad={initialLoad}
          onClose={close}
          onRemove={openNext}
        />
      )
    },
    [orderedIds, initialLoad, close, openNext],
  )

  const renderFooter = useCallback(
    (bankTransaction: BankTransaction, { isExpanded }: { isExpanded: boolean }) => (
      <BankTransactionsMobileListItemFooter bankTransaction={bankTransaction} isExpanded={isExpanded} />
    ),
    [],
  )

  const renderExpandedContent = useCallback(
    (bankTransaction: BankTransaction) => (
      <BankTransactionsMobileListItemExpandedRow
        bankTransaction={bankTransaction}
        isOpen={expandedKeys.has(bankTransaction.id)}
        showDescriptions={showDescriptions}
        showReceiptUploads={showReceiptUploads}
        showTooltips={showTooltips}
      />
    ),
    [expandedKeys, showDescriptions, showReceiptUploads, showTooltips],
  )

  return (
    <>
      <BankTransactionsMobileBulkActionsHeader
        bankTransactions={bankTransactions}
        bulkActionsEnabled={bulkActionsEnabled}
        onBulkActionsToggle={setBulkActionsEnabled}
      />
      <div className='Layer__BankTransactionsMobileList'>
        <MobileList
          ariaLabel={t('bankTransactions:label.transactions', 'Transactions')}
          data={bankTransactions}
          isLoading={false}
          isError={false}
          slots={LIST_SLOTS}
          renderItem={renderItem}
          renderFooter={renderFooter}
          renderExpandedContent={renderExpandedContent}
          expandedKeys={expandedKeys}
          onClickItem={bulkActionsEnabled ? undefined : onClickItem}
          {...bulkSelectionProps}
        />
      </div>
    </>
  )
}
