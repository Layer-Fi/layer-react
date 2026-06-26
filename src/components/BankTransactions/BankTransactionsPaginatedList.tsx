import type { ReactNode } from 'react'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { usePaginatedList } from '@hooks/utils/pagination/usePaginatedList'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useBankTransactionsPaginationContext } from '@contexts/BankTransactionsPaginationContext/BankTransactionsPaginationContext'
import { Pagination } from '@components/Pagination/Pagination'

type RenderBankTransactionsList = (bankTransactions?: BankTransaction[]) => ReactNode

type BankTransactionsPaginatedListProps = {
  children: RenderBankTransactionsList
}

const EMPTY_ARRAY = [] as const

export const BankTransactionsPaginatedList = ({
  children,
}: BankTransactionsPaginatedListProps) => {
  const { data: bankTransactions, isLoading, isError } = useBankTransactionsContext()
  const { isMonthlyViewMode } = useBankTransactionsFiltersContext()
  const paginationProps = useBankTransactionsPaginationContext()

  const { pageIndex, onPageIndexChange, pageSize = 20, hasMore, fetchMore, autoResetPageIndexRef } = paginationProps
  const { onPageChange, pageItems, pageIndex: currentPageIndex } = usePaginatedList({
    autoResetPageIndexRef: isMonthlyViewMode ? undefined : autoResetPageIndexRef,
    data: bankTransactions ?? EMPTY_ARRAY,
    pageSize,
    pageIndex: isMonthlyViewMode ? undefined : pageIndex,
    onPageIndexChange: isMonthlyViewMode ? undefined : onPageIndexChange,
  })

  const totalCount = bankTransactions?.length ?? 0
  const showPagination = !isMonthlyViewMode && !isLoading && !isError && totalCount > 0

  return (
    <>
      {children(isMonthlyViewMode ? bankTransactions : pageItems)}
      {showPagination && (
        <Pagination
          currentPage={currentPageIndex + 1}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          fetchMore={fetchMore}
          hasMore={hasMore}
        />
      )}
    </>
  )
}
