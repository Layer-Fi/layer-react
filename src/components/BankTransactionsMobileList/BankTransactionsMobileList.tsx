import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useBankTransactionsPaginatedList } from '@hooks/features/bankTransactions/useBankTransactionsPaginatedList'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
import { useBulkSelectionActions } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useMobileListBulkSelection } from '@providers/BulkSelectionStore/useMobileListBulkSelection'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { MobileList } from '@ui/MobileList/MobileList'
import { PaginatedMobileList } from '@ui/MobileList/PaginatedMobileList'
import { useMobileListExpansion } from '@ui/MobileList/useMobileListExpansion'
import { VStack } from '@ui/Stack/Stack'
import { BankTransactionsMobileBulkActionsHeader } from '@components/BankTransactionsMobileList/BankTransactionsMobileBulkActionsHeader'
import { BankTransactionsMobileListItem } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItem'
import { BankTransactionsMobileListItemExpandedRow } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemExpandedRow'
import { BankTransactionsMobileListItemFooter } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemFooter'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

export interface BankTransactionsMobileListProps {
  bankTransactions?: BankTransaction[]
  isMonthlyViewMode: boolean
  paginationProps: TablePaginationProps

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

const EmptyState = () => null
const ErrorState = () => null
const LIST_SLOTS = { EmptyState, ErrorState }

export const BankTransactionsMobileList = ({
  bankTransactions,
  isMonthlyViewMode,
  paginationProps,
  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsMobileListProps) => {
  const { t } = useTranslation()
  const [bulkActionsEnabled, setBulkActionsEnabled] = useState(false)

  const { clearSelection } = useBulkSelectionActions()
  const { shouldHideAfterCategorize, removeAfterCategorize } = useBankTransactionsContext()
  const { displayedBankTransactions } = useBankTransactionsPaginatedList({
    bankTransactions,
    isMonthlyViewMode,
    paginationProps,
  })

  useUpsertBankTransactionsDefaultCategories(displayedBankTransactions)

  const orderedIds = useMemo(
    () => displayedBankTransactions?.map(tx => tx.id) ?? [],
    [displayedBankTransactions],
  )

  const exitingKeys = useMemo(() => {
    if (!shouldHideAfterCategorize || !displayedBankTransactions) {
      return new Set<string>()
    }
    return new Set(displayedBankTransactions.filter(tx => tx.recentlyCategorized).map(tx => tx.id))
  }, [displayedBankTransactions, shouldHideAfterCategorize])

  const bulkSelectionProps = useMobileListBulkSelection(orderedIds, { enabled: bulkActionsEnabled })

  const firstId = orderedIds[0]

  const { expandedKeys, open, close, toggle, closeAll, openNext } =
    useMobileListExpansion(orderedIds, {
      defaultExpandedIds: firstId ? [firstId] : undefined,
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
    else if (firstId) {
      open(firstId)
    }
  }, [bulkActionsEnabled, firstId, closeAll, open])

  const onClickItem = useCallback(
    (bankTransaction: BankTransaction) => toggle(bankTransaction.id),
    [toggle],
  )

  const renderItem = useCallback(
    (bankTransaction: BankTransaction) => (
      <BankTransactionsMobileListItem bankTransaction={bankTransaction} onClose={close} />
    ),
    [close],
  )

  const onRemoveItem = useCallback(
    (bankTransaction: BankTransaction) => {
      removeAfterCategorize([bankTransaction.id])
      openNext(bankTransaction.id)
    },
    [removeAfterCategorize, openNext],
  )

  const renderFooter = useCallback(
    (bankTransaction: BankTransaction) => (
      <BankTransactionsMobileListItemFooter bankTransaction={bankTransaction} />
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

  const mobileListProps = {
    ariaLabel: t('bankTransactions:label.transactions', 'Transactions'),
    data: bankTransactions,
    isLoading: false,
    isError: false,
    slots: LIST_SLOTS,
    renderItem,
    renderFooter,
    renderExpandedContent,
    expandedKeys,
    exitingKeys,
    onRemoveItem,
    onClickItem: bulkActionsEnabled ? undefined : onClickItem,
    ...bulkSelectionProps,
  }

  return (
    <>
      <BankTransactionsMobileBulkActionsHeader
        bankTransactions={displayedBankTransactions}
        bulkActionsEnabled={bulkActionsEnabled}
        onBulkActionsToggle={setBulkActionsEnabled}
      />
      <VStack pbs='sm'>
        {isMonthlyViewMode
          ? <MobileList {...mobileListProps} />
          : (
            <PaginatedMobileList
              {...mobileListProps}
              paginationProps={paginationProps}
            />
          )}
      </VStack>
    </>
  )
}
