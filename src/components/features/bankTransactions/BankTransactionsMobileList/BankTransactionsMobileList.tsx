import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { useBulkSelectionActions } from '@providers/common/BulkSelectionStore/BulkSelectionStoreProvider'
import { useMobileListBulkSelection } from '@providers/common/BulkSelectionStore/useMobileListBulkSelection'
import { useBankTransactionsContext } from '@providers/features/bankTransactions/BankTransactions/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@providers/features/bankTransactions/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
import { VStack } from '@ui/Stack/Stack'
import { MobileList } from '@blocks/MobileList/MobileList'
import { useMobileListExpansion } from '@blocks/MobileList/useMobileListExpansion'
import { BankTransactionsEmptyState, BankTransactionsErrorState } from '@features/bankTransactions/BankTransactionsDataStates/BankTransactionsDataStates'
import { BankTransactionsMobileBulkActionsHeader } from '@features/bankTransactions/BankTransactionsMobileList/BankTransactionsMobileBulkActionsHeader'
import { BankTransactionsMobileListItem } from '@features/bankTransactions/BankTransactionsMobileList/BankTransactionsMobileListItem'
import { BankTransactionsMobileListItemExpandedRow } from '@features/bankTransactions/BankTransactionsMobileList/BankTransactionsMobileListItemExpandedRow'
import { BankTransactionsMobileListItemFooter } from '@features/bankTransactions/BankTransactionsMobileList/BankTransactionsMobileListItemFooter'
import { BankTransactionsPaginatedList } from '@features/bankTransactions/BankTransactionsPaginatedList/BankTransactionsPaginatedList'

const LEGACY_ITEM_CLASS_NAME = 'Layer__bank-transaction-mobile-list-item Layer__BankTransactionsMobileListItem'

type BankTransactionsMobileListContentProps = {
  bankTransactions?: BankTransaction[]
}

const EmptyState = () => <BankTransactionsEmptyState />
const ErrorState = () => <BankTransactionsErrorState />
const LIST_SLOTS = { EmptyState, ErrorState }

const BankTransactionsMobileListContent = ({
  bankTransactions,
}: BankTransactionsMobileListContentProps) => {
  const { t } = useTranslation()
  const [bulkActionsEnabled, setBulkActionsEnabled] = useState(false)

  const { clearSelection } = useBulkSelectionActions()
  const { shouldHideAfterCategorize, removeAfterCategorize, isLoading, isError } = useBankTransactionsContext()

  useUpsertBankTransactionsDefaultCategories(bankTransactions)

  const orderedIds = useMemo(
    () => bankTransactions?.map(tx => tx.id) ?? [],
    [bankTransactions],
  )

  const exitingKeys = useMemo(() => {
    if (!shouldHideAfterCategorize || !bankTransactions) {
      return new Set<string>()
    }
    return new Set(bankTransactions.filter(tx => tx.recentlyCategorized).map(tx => tx.id))
  }, [bankTransactions, shouldHideAfterCategorize])

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
      close(bankTransaction.id)
      openNext(bankTransaction.id)
    },
    [removeAfterCategorize, close, openNext],
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
      />
    ),
    [expandedKeys],
  )

  const hasTransactions = (bankTransactions?.length ?? 0) > 0

  return (
    <>
      {!isLoading && !isError && hasTransactions && (
        <BankTransactionsMobileBulkActionsHeader
          bankTransactions={bankTransactions}
          bulkActionsEnabled={bulkActionsEnabled}
          onBulkActionsToggle={setBulkActionsEnabled}
        />
      )}
      <VStack pbs='sm'>
        <MobileList
          ariaLabel={t('bankTransactions:BankTransactionsMobileList.label.transactions', 'Transactions')}
          itemClassName={LEGACY_ITEM_CLASS_NAME}
          data={bankTransactions}
          isLoading={isLoading}
          isError={isError}
          slots={LIST_SLOTS}
          renderItem={renderItem}
          renderFooter={renderFooter}
          renderExpandedContent={renderExpandedContent}
          expandedKeys={expandedKeys}
          exitingKeys={exitingKeys}
          onRemoveItem={onRemoveItem}
          onClickItem={bulkActionsEnabled ? undefined : onClickItem}
          {...bulkSelectionProps}
        />
      </VStack>
    </>
  )
}

export const BankTransactionsMobileList = () => {
  const { filters: { categorizationStatus } } = useBankTransactionsFiltersContext()

  return (
    <BankTransactionsPaginatedList>
      {displayedTransactions => (
        <BankTransactionsMobileListContent
          // Remount on tab change so expansion and bulk-mode state reset per tab
          key={categorizationStatus}
          bankTransactions={displayedTransactions}
        />
      )}
    </BankTransactionsPaginatedList>
  )
}
