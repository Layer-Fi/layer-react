import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type CreateCustomerRefundSchema, CustomerRefundSchema } from '@schemas/invoices/customerRefund'
import { type Invoice } from '@schemas/invoices/invoice'
import { InvoiceStatus } from '@schemas/invoices/invoiceStatus'
import { post } from '@utils/shared/api/authenticatedHttp'
import { useInvoicesGlobalCacheActions } from '@api/businesses/[business-id]/invoices/get'
import { useInvoiceSummaryStatsCacheActions } from '@api/businesses/[business-id]/invoices/summary-stats/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const REFUND_INVOICE_TAG_KEY = '#refund-invoice'

const RefundInvoiceReturnSchema = UnwrappedDataResponseSchema(CustomerRefundSchema)

const refundInvoice = post<
  typeof RefundInvoiceReturnSchema.Encoded,
  typeof CreateCustomerRefundSchema.Encoded,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/refund`)

export const updateInvoiceWithRefund = (invoice: Invoice): Invoice => {
  return { ...invoice, status: InvoiceStatus.Refunded }
}

const applyRefundToInvoice = (invoiceId: string) => (invoice: Invoice) => {
  if (invoice.id !== invoiceId) return invoice
  return updateInvoiceWithRefund(invoice)
}

export const usePostRefundInvoice = createMutationHook({
  tags: [REFUND_INVOICE_TAG_KEY],
  request: refundInvoice,
  keyParams: ['invoiceId'],
  schema: RefundInvoiceReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: ({ invoiceId }) => {
    const { patchByTransformation: patchInvoiceWithTransformation } = useInvoicesGlobalCacheActions()
    const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

    return () => {
      void patchInvoiceWithTransformation(applyRefundToInvoice(invoiceId))
      void forceReloadInvoiceSummaryStats()
    }
  },
})
