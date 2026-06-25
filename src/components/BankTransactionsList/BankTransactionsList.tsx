import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useBankTransactionsPaginatedList } from '@hooks/features/bankTransactions/useBankTransactionsPaginatedList'
import { useBankTransactionsTableCheckboxState } from '@hooks/features/bankTransactions/useBankTransactionsTableCheckboxState'
import { useUpsertBankTransactionsDefaultCategories } from '@hooks/features/bankTransactions/useUpsertBankTransactionsDefaultCategories'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import {
  type BankTransactionCTAStringOverrides,
} from '@components/BankTransactions/BankTransactions'
import { BankTransactionsListItem } from '@components/BankTransactionsList/BankTransactionsListItem'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'
import { Pagination } from '@components/Pagination/Pagination'

import './bankTransactionsList.scss'

interface BankTransactionsListProps {
  bankTransactions?: BankTransaction[]
  stringOverrides?: BankTransactionCTAStringOverrides
  isMonthlyViewMode: boolean
  paginationProps: TablePaginationProps

  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BankTransactionsList = ({
  bankTransactions,
  stringOverrides,
  isMonthlyViewMode,
  paginationProps,

  showDescriptions,
  showReceiptUploads,
  showTooltips,
}: BankTransactionsListProps) => {
  const { t } = useTranslation()
  const {
    currentPageIndex,
    displayedBankTransactions,
    fetchMore,
    hasMore,
    onPageChange,
    pageSize,
  } = useBankTransactionsPaginatedList({
    bankTransactions,
    isMonthlyViewMode,
    paginationProps,
  })

  const { isAllSelected, isPartiallySelected, onHeaderCheckboxChange } = useBankTransactionsTableCheckboxState({ bankTransactions: displayedBankTransactions })
  useUpsertBankTransactionsDefaultCategories(displayedBankTransactions)

  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  return (
    <>
      {isCategorizationEnabled && (
        <HStack gap='md' pi='md' pb='md' align='center'>
          <Checkbox
            isSelected={isAllSelected}
            isIndeterminate={isPartiallySelected}
            onChange={onHeaderCheckboxChange}
            aria-label={t('bankTransactions:label.select_all_transactions', 'Select all transactions on this page')}
          />
          <Span size='sm'>
            {t('common:label.select_all', 'Select all')}
          </Span>
        </HStack>
      )}
      <ul className='Layer__bank-transactions__list'>
        {displayedBankTransactions?.map(
          (bankTransaction: BankTransaction) => (
            <BankTransactionsListItem
              key={bankTransaction.id}
              bankTransaction={bankTransaction}
              stringOverrides={stringOverrides}

              showDescriptions={showDescriptions}
              showReceiptUploads={showReceiptUploads}
              showTooltips={showTooltips}
            />
          ),
        )}
      </ul>
      {!isMonthlyViewMode && (
        <HStack justify='end'>
          <Pagination
            currentPage={currentPageIndex + 1}
            totalCount={bankTransactions?.length || 0}
            pageSize={pageSize}
            onPageChange={onPageChange}
            fetchMore={fetchMore}
            hasMore={hasMore}
          />
        </HStack>
      )}
    </>
  )
}
