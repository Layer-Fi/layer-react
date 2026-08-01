import { useMemo } from 'react'

import { useGetInfiniteInvoices } from '@api/businesses/[business-id]/invoices/get'
import { useTablePaginationProps } from '@hooks/utils/pagination/useTablePaginationProps'
import { useInvoiceTableFilters } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { getListInvoiceParamsFromFilters } from '@components/Invoices/utils/invoiceFilters'

const PAGE_SIZE = 10

export const useInvoicesList = () => {
  const { tableFilters } = useInvoiceTableFilters()
  const listInvoiceParams = useMemo(() => getListInvoiceParamsFromFilters(tableFilters), [tableFilters])

  const { data, flattenedData: invoices, isLoading, isError, hasMore, fetchMore, refetch } = useGetInfiniteInvoices(listInvoiceParams)

  const paginationProps = useTablePaginationProps({
    filterParams: listInvoiceParams,
    data,
    pageSize: PAGE_SIZE,
    hasMore,
    fetchMore,
  })

  return {
    invoices,
    isLoading,
    isError,
    paginationProps,
    refetch,
  }
}
