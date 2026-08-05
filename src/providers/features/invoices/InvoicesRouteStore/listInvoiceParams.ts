import { getStatusFilterParams } from '@utils/features/invoices/invoiceStatus'
import { type ListInvoicesFilterParams } from '@api/businesses/[business-id]/invoices/get'
import { type InvoiceTableFilters } from '@providers/features/invoices/InvoicesRouteStore/InvoicesRouteStoreProvider'

export const getListInvoiceParamsFromFilters = (
  { showSalesReceipts, status, query }: InvoiceTableFilters,
): ListInvoicesFilterParams => {
  const statusFilterParams = getStatusFilterParams(status.value)
  return { ...statusFilterParams, showSalesReceipts, query }
}
