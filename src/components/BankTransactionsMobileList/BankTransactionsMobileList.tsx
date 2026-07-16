import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
import { useBulkSelectionActions } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useMobileListBulkSelection } from '@providers/BulkSelectionStore/useMobileListBulkSelection'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { MobileList } from '@ui/MobileList/MobileList'
import { useMobileListExpansion } from '@ui/MobileList/useMobileListExpansion'
import { VStack } from '@ui/Stack/Stack'
import { BankTransactionsPaginatedList } from '@components/BankTransactions/BankTransactionsPaginatedList'
import { BankTransactionsEmptyState, BankTransactionsErrorState } from '@components/BankTransactions/BankTransactionsTableEmptyState'
import { BankTransactionsMobileBulkActionsHeader } from '@components/BankTransactionsMobileList/BankTransactionsMobileBulkActionsHeader'
import { BankTransactionsMobileListItem } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItem'
import { BankTransactionsMobileListItemExpandedRow } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemExpandedRow'
import { BankTransactionsMobileListItemFooter } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemFooter'

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
          ariaLabel={t('bankTransactions:label.transactions', 'Transactions')}
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
