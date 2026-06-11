import { useCallback, useMemo } from 'react'

import { useListInvoices } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { useInvoiceTableFilters } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { getListInvoiceParamsFromFilters } from '@components/Invoices/utils/invoiceFilters'
import { type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

export const useInvoicesList = () => {
  const { tableFilters } = useInvoiceTableFilters()
  const listInvoiceParams = useMemo(() => getListInvoiceParamsFromFilters(tableFilters), [tableFilters])

  const { data, isLoading, isError, size, setSize, refetch } = useListInvoices({ ...listInvoiceParams })
  const invoices = useMemo(() => data?.flatMap(({ data }) => data), [data])

  const paginationMeta = data?.[data.length - 1]?.meta.pagination
  const hasMore = paginationMeta?.hasMore

  const fetchMore = useCallback(() => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  const paginationProps: TablePaginationProps = useMemo(() => ({
    pageSize: 10,
    hasMore,
    fetchMore,
  }), [fetchMore, hasMore])

  return {
    invoices,
    isLoading: data === undefined || isLoading,
    isError,
    paginationProps,
    refetch,
  }
}
