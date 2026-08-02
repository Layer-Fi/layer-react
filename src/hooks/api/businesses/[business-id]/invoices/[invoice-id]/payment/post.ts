import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { type InvoicePayment, InvoicePaymentSchema, type UpsertDedicatedInvoicePaymentSchema } from '@schemas/invoices/invoicePayment'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { useInvoicesGlobalCacheActions } from '@api/businesses/[business-id]/invoices/get'
import { useInvoiceSummaryStatsCacheActions } from '@api/businesses/[business-id]/invoices/summary-stats/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

export const UPSERT_INVOICE_PAYMENT_TAG_KEY = '#upsert-dedicated-invoice-payment'

export type UpsertDedicatedInvoicePaymentBody = typeof UpsertDedicatedInvoicePaymentSchema.Encoded

export const UpsertDedicatedInvoicePaymentReturnSchema = UnwrappedDataResponseSchema(InvoicePaymentSchema)

export type UpsertDedicatedInvoicePaymentReturnEncoded = typeof UpsertDedicatedInvoicePaymentReturnSchema.Encoded

export type CreateParams = {
  readonly businessId: string
  readonly invoiceId: string
}

export const updateInvoiceWithPayment = (invoice: Invoice, invoicePayment: InvoicePayment) => {
  const outstandingBalance = invoice.outstandingBalance - invoicePayment.amount
  const status = outstandingBalance === 0 ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid

  return { ...invoice, status, outstandingBalance }
}

const applyPaymentToInvoice = (invoiceId: string, invoicePayment: InvoicePayment) =>
  (invoice: Invoice) => {
    if (invoice.id !== invoiceId) return invoice
    return updateInvoiceWithPayment(invoice, invoicePayment)
  }

export const useDedicatedInvoicePaymentTriggerSuccess = ({ invoiceId }: { invoiceId: string }) => {
  const { patchByTransformation: patchInvoiceWithTransformation } = useInvoicesGlobalCacheActions()
  const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

  return (invoicePayment: InvoicePayment) => {
    void patchInvoiceWithTransformation(applyPaymentToInvoice(invoiceId, invoicePayment))
    void forceReloadInvoiceSummaryStats()
  }
}

const createDedicatedInvoicePayment = post<
  UpsertDedicatedInvoicePaymentReturnEncoded,
  UpsertDedicatedInvoicePaymentBody,
  CreateParams
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/payment/`)

export const usePostDedicatedInvoicePayment = createMutationHook({
  tags: [UPSERT_INVOICE_PAYMENT_TAG_KEY],
  request: createDedicatedInvoicePayment,
  keyParams: ['invoiceId'],
  schema: UpsertDedicatedInvoicePaymentReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useDedicatedInvoicePaymentTriggerSuccess,
})
