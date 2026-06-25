import type { ReactNode } from 'react'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { usePaginatedList } from '@hooks/utils/pagination/usePaginatedList'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'
import { Pagination } from '@components/Pagination/Pagination'

type RenderBankTransactionsList = (bankTransactions?: BankTransaction[]) => ReactNode

type BankTransactionsPaginatedListProps = {
  bankTransactions?: BankTransaction[]
  children: RenderBankTransactionsList
  isMonthlyViewMode: boolean
  paginationProps: TablePaginationProps
}

const EMPTY_ARRAY = [] as const

export const BankTransactionsPaginatedList = ({
  bankTransactions,
  children,
  isMonthlyViewMode,
  paginationProps,
}: BankTransactionsPaginatedListProps) => {
  const { pageIndex, onPageIndexChange, pageSize = 20, hasMore, fetchMore, autoResetPageIndexRef } = paginationProps
  const { onPageChange, pageItems, pageIndex: currentPageIndex } = usePaginatedList({
    autoResetPageIndexRef: isMonthlyViewMode ? undefined : autoResetPageIndexRef,
    data: bankTransactions ?? EMPTY_ARRAY,
    pageSize,
    pageIndex: isMonthlyViewMode ? undefined : pageIndex,
    onPageIndexChange: isMonthlyViewMode ? undefined : onPageIndexChange,
  })

  return (
    <>
      {children(isMonthlyViewMode ? bankTransactions : pageItems)}
      {!isMonthlyViewMode && (
        <Pagination
          currentPage={currentPageIndex + 1}
          totalCount={bankTransactions?.length ?? 0}
          pageSize={pageSize}
          onPageChange={onPageChange}
          fetchMore={fetchMore}
          hasMore={hasMore}
        />
      )}
    </>
  )
}
