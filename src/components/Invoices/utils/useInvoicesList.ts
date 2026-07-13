import { useMemo } from 'react'

import { useListInvoices } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { useInvoiceTableFilters } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { getListInvoiceParamsFromFilters } from '@components/Invoices/utils/invoiceFilters'
import { type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

export const useInvoicesList = () => {
  const { tableFilters } = useInvoiceTableFilters()
  const listInvoiceParams = useMemo(() => getListInvoiceParamsFromFilters(tableFilters), [tableFilters])

  const { flattenedData: invoices, isLoading, isError, hasMore, fetchMore, refetch } = useListInvoices({ ...listInvoiceParams })

  const paginationProps: TablePaginationProps = useMemo(() => ({
    pageSize: 10,
    hasMore,
    fetchMore,
  }), [fetchMore, hasMore])

  return {
    invoices,
    isLoading,
    isError,
    paginationProps,
    refetch,
  }
}
