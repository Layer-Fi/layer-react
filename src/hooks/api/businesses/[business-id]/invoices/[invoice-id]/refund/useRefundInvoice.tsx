import { useCallback } from 'react'

import { type CreateCustomerRefundSchema, CustomerRefundSchema } from '@schemas/invoices/customerRefund'
import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useInvoiceSummaryStatsCacheActions } from '@hooks/api/businesses/[business-id]/invoices/summary-stats/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const REFUND_INVOICE_TAG_KEY = '#refund-invoice'

const RefundInvoiceReturnSchema = UnwrappedDataResponseSchema(CustomerRefundSchema)

const refundInvoice = post<
  typeof RefundInvoiceReturnSchema.Encoded,
  typeof CreateCustomerRefundSchema.Encoded,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/refund`)

const useRefundInvoiceMutation = createMutationHook({
  tags: [REFUND_INVOICE_TAG_KEY],
  request: refundInvoice,
  keyParams: ['invoiceId'],
  schema: RefundInvoiceReturnSchema,
  swrOptions: { throwOnError: true },
})

export const updateInvoiceWithRefund = (invoice: Invoice): Invoice => {
  return { ...invoice, status: InvoiceStatus.Refunded }
}

type UseRefundInvoiceProps = { invoiceId: string }
export const useRefundInvoice = ({ invoiceId }: UseRefundInvoiceProps) => {
  const applyRefundToInvoice = useCallback(() =>
    (invoice: Invoice) => {
      if (invoice.id !== invoiceId) return invoice
      return updateInvoiceWithRefund(invoice)
    }, [invoiceId])

  const mutationResponse = useRefundInvoiceMutation({ invoiceId })

  const { patchByTransformation: patchInvoiceWithTransformation } = useInvoicesGlobalCacheActions()
  const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void patchInvoiceWithTransformation(applyRefundToInvoice())

      void forceReloadInvoiceSummaryStats()

      return triggerResult
    },
    [originalTrigger, patchInvoiceWithTransformation, applyRefundToInvoice, forceReloadInvoiceSummaryStats],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
