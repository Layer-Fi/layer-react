import { Schema } from 'effect'

import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type Invoice } from '@schemas/features/invoices/invoice'
import { InvoiceStatus } from '@schemas/features/invoices/invoiceStatus'
import { type CreateInvoiceWriteoff, CreateInvoiceWriteoffSchema, InvoiceWriteoffSchema } from '@schemas/features/invoices/invoiceWriteoff'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useInvoicesGlobalCacheActions } from '@api/businesses/[business-id]/invoices/get'
import { useInvoiceSummaryStatsCacheActions } from '@api/businesses/[business-id]/invoices/summary-stats/get'

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

export const usePostWriteoffInvoice = createMutationHook({
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
