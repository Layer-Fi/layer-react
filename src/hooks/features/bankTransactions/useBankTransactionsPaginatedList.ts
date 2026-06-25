import type { BankTransaction } from '@internal-types/bankTransactions'
import { usePaginatedList } from '@hooks/utils/pagination/usePaginatedList'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

type UseBankTransactionsPaginatedListParams = {
  bankTransactions?: BankTransaction[]
  isMonthlyViewMode: boolean
  paginationProps: TablePaginationProps
}

export const useBankTransactionsPaginatedList = ({
  bankTransactions,
  isMonthlyViewMode,
  paginationProps,
}: UseBankTransactionsPaginatedListParams) => {
  const { pageIndex, onPageIndexChange, pageSize = 20, hasMore, fetchMore } = paginationProps

  const { onPageChange, pageItems, pageIndex: currentPageIndex } = usePaginatedList({
    data: bankTransactions ?? [],
    pageSize,
    pageIndex: isMonthlyViewMode ? undefined : pageIndex,
    onPageIndexChange: isMonthlyViewMode ? undefined : onPageIndexChange,
  })

  return {
    currentPageIndex,
    displayedBankTransactions: isMonthlyViewMode ? bankTransactions : pageItems,
    fetchMore,
    hasMore,
    onPageChange,
    pageSize,
  }
}
