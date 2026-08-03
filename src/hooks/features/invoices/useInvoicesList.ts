import { useMemo } from 'react'

import { useGetListInvoices } from '@api/businesses/[business-id]/invoices/get'
import { useTablePaginationProps } from '@hooks/utils/pagination/useTablePaginationProps'
import { useInvoiceTableFilters } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { getListInvoiceParamsFromFilters } from '@features/invoices/utils'

const PAGE_SIZE = 10

export const useInvoicesList = () => {
  const { tableFilters } = useInvoiceTableFilters()
  const listInvoiceParams = useMemo(() => getListInvoiceParamsFromFilters(tableFilters), [tableFilters])

  const { data, flattenedData: invoices, isLoading, isError, hasMore, fetchMore, refetch } = useGetListInvoices(listInvoiceParams)

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
