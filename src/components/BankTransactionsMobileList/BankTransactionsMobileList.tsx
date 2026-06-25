import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
import { useBulkSelectionActions } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useMobileListBulkSelection } from '@providers/BulkSelectionStore/useMobileListBulkSelection'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { MobileList } from '@ui/MobileList/MobileList'
import { useMobileListExpansion } from '@ui/MobileList/useMobileListExpansion'
import { VStack } from '@ui/Stack/Stack'
import { BankTransactionsPaginatedList } from '@components/BankTransactions/BankTransactionsPaginatedList'
import { BankTransactionsMobileBulkActionsHeader } from '@components/BankTransactionsMobileList/BankTransactionsMobileBulkActionsHeader'
import { BankTransactionsMobileListItem } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItem'
import { BankTransactionsMobileListItemExpandedRow } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemExpandedRow'
import { BankTransactionsMobileListItemFooter } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItemFooter'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

export interface BankTransactionsMobileListProps {
  bankTransactions?: BankTransaction[]
  isMonthlyViewMode: boolean
  paginationProps: TablePaginationProps
}

type BankTransactionsMobileListContentProps = Pick<
  BankTransactionsMobileListProps,
  'bankTransactions'
>

const EmptyState = () => null
const ErrorState = () => null
const LIST_SLOTS = { EmptyState, ErrorState }

const BankTransactionsMobileListContent = ({
  bankTransactions,
}: BankTransactionsMobileListContentProps) => {
  const { t } = useTranslation()
  const [bulkActionsEnabled, setBulkActionsEnabled] = useState(false)

  const { clearSelection } = useBulkSelectionActions()
  const { shouldHideAfterCategorize, removeAfterCategorize } = useBankTransactionsContext()

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
      />
    ),
    [expandedKeys],
  )

  return (
    <>
      <BankTransactionsMobileBulkActionsHeader
        bankTransactions={bankTransactions}
        bulkActionsEnabled={bulkActionsEnabled}
        onBulkActionsToggle={setBulkActionsEnabled}
      />
      <VStack pbs='sm'>
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
          exitingKeys={exitingKeys}
          onRemoveItem={onRemoveItem}
          onClickItem={bulkActionsEnabled ? undefined : onClickItem}
          {...bulkSelectionProps}
        />
      </VStack>
    </>
  )
}

export const BankTransactionsMobileList = ({
  bankTransactions,
  isMonthlyViewMode,
  paginationProps,
  ...contentProps
}: BankTransactionsMobileListProps) => (
  <BankTransactionsPaginatedList
    bankTransactions={bankTransactions}
    isMonthlyViewMode={isMonthlyViewMode}
    paginationProps={paginationProps}
  >
    {displayedTransactions => (
      <BankTransactionsMobileListContent bankTransactions={displayedTransactions} {...contentProps} />
    )}
  </BankTransactionsPaginatedList>
)
