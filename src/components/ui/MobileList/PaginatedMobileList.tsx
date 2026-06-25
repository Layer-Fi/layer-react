import { usePaginatedList } from '@hooks/utils/pagination/usePaginatedList'
import { MobileList, type MobileListProps } from '@ui/MobileList/MobileList'
import { VStack } from '@ui/Stack/Stack'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'
import { Pagination } from '@components/Pagination/Pagination'

type PaginatedMobileListProps<TData> = Omit<MobileListProps<TData>, 'data'> & {
  data: ReadonlyArray<TData> | undefined
  paginationProps: TablePaginationProps
}

const EMPTY_ARRAY = [] as const

export const PaginatedMobileList = <TData extends { id: string }>(
  props: PaginatedMobileListProps<TData>,
) => {
  const { data, paginationProps, ...listProps } = props
  const {
    pageIndex,
    onPageIndexChange,
    pageSize = 20,
    hasMore,
    fetchMore,
    autoResetPageIndexRef,
  } = paginationProps

  const { onPageChange, pageItems, pageIndex: currentPageIndex } = usePaginatedList({
    autoResetPageIndexRef,
    data: data ?? EMPTY_ARRAY,
    pageSize,
    pageIndex,
    onPageIndexChange,
  })

  return (
    <VStack>
      <MobileList {...listProps} data={pageItems} />
      {!listProps.isError && !listProps.isLoading && (
        <Pagination
          currentPage={currentPageIndex + 1}
          onPageChange={onPageChange}
          pageSize={pageSize}
          totalCount={data?.length ?? 0}
          hasMore={hasMore}
          fetchMore={fetchMore}
        />
      )}
    </VStack>
  )
}
