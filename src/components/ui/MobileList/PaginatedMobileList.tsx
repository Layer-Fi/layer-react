import { useCallback, useEffect } from 'react'

import { usePaginatedList } from '@hooks/array/usePaginatedList'
import { MobileList, type MobileListProps } from '@ui/MobileList/MobileList'
import { VStack } from '@ui/Stack/Stack'
import type { TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'
import { Pagination } from '@components/Pagination/Pagination'

type PaginatedMobileListProps<TData> = Omit<MobileListProps<TData>, 'data'> & {
  data: TData[] | undefined
  paginationProps: TablePaginationProps
}

const EMPTY_ARRAY = [] as const

export const PaginatedMobileList = <TData extends { id: string }>(
  props: PaginatedMobileListProps<TData>,
) => {
  const { data, paginationProps, ...listProps } = props
  const { initialPage = 0, onSetPage, pageSize = 20, hasMore, fetchMore, autoResetPageIndexRef } = paginationProps

  const { pageItems, pageIndex, setPage } = usePaginatedList({ data: data ?? EMPTY_ARRAY, pageSize, initialPage, onSetPage })

  const onPageChange = useCallback((page: number) => {
    setPage(page - 1)
  }, [setPage])

  useEffect(() => {
    if (autoResetPageIndexRef?.current) {
      setPage(0)
    }
  }, [autoResetPageIndexRef, data, setPage])

  return (
    <VStack>
      <MobileList {...listProps} data={pageItems} />
      {!listProps.isError && !listProps.isLoading && (
        <Pagination
          currentPage={pageIndex + 1}
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
