import { Schema } from 'effect'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { type CreateInvoiceWriteoff, CreateInvoiceWriteoffSchema, InvoiceWriteoffSchema } from '@schemas/invoices/invoiceWriteoff'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { useInvoiceSummaryStatsCacheActions } from '@hooks/api/businesses/[business-id]/invoices/summary-stats/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const CREATE_INVOICE_WRITEOFF_TAG_KEY = '#writeoff-invoice'

const WriteoffInvoiceReturnSchema = UnwrappedDataResponseSchema(InvoiceWriteoffSchema)

const writeoffInvoice = post<
  typeof WriteoffInvoiceReturnSchema.Encoded,
  typeof CreateInvoiceWriteoffSchema.Encoded,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/write-off`)

export const updateInvoiceWithWriteoff = (invoice: Invoice): Invoice => {
  const status = invoice.status === InvoiceStatus.PartiallyPaid ? InvoiceStatus.PartiallyWrittenOff : InvoiceStatus.WrittenOff

  return { ...invoice, status, outstandingBalance: 0 }
}

const applyWriteoffToInvoice = (invoiceId: string) => (invoice: Invoice) => {
  if (invoice.id !== invoiceId) return invoice
  return updateInvoiceWithWriteoff(invoice)
}

export const useWriteoffInvoice = createMutationHook({
  tags: [CREATE_INVOICE_WRITEOFF_TAG_KEY],
  request: writeoffInvoice,
  keyParams: ['invoiceId'],
  argToBody: (arg: CreateInvoiceWriteoff) => Schema.encodeSync(CreateInvoiceWriteoffSchema)(arg),
  schema: WriteoffInvoiceReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: ({ invoiceId }) => {
    const { patchByTransformation: patchInvoiceWithTransformation } = useInvoicesGlobalCacheActions()
    const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

    return () => {
      void patchInvoiceWithTransformation(applyWriteoffToInvoice(invoiceId))
      void forceReloadInvoiceSummaryStats()
    }
  },
})
