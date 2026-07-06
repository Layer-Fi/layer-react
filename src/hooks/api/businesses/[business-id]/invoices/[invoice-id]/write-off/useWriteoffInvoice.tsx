import { useCallback } from 'react'
import { Schema } from 'effect'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { type CreateInvoiceWriteoff, CreateInvoiceWriteoffSchema, InvoiceWriteoffSchema } from '@schemas/invoices/invoiceWriteoff'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
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

const useWriteoffInvoiceMutation = createMutationHook({
  tags: [CREATE_INVOICE_WRITEOFF_TAG_KEY],
  request: writeoffInvoice,
  keyParams: ['invoiceId'],
  argToBody: (arg: CreateInvoiceWriteoff) => Schema.encodeSync(CreateInvoiceWriteoffSchema)(arg),
  schema: WriteoffInvoiceReturnSchema,
  swrOptions: { throwOnError: true },
})

export const updateInvoiceWithWriteoff = (invoice: Invoice): Invoice => {
  const status = invoice.status === InvoiceStatus.PartiallyPaid ? InvoiceStatus.PartiallyWrittenOff : InvoiceStatus.WrittenOff

  return { ...invoice, status, outstandingBalance: 0 }
}

type UseWriteoffInvoiceProps = { invoiceId: string }
export const useWriteoffInvoice = ({ invoiceId }: UseWriteoffInvoiceProps) => {
  const applyWriteoffToInvoice = useCallback(() =>
    (invoice: Invoice) => {
      if (invoice.id !== invoiceId) return invoice
      return updateInvoiceWithWriteoff(invoice)
    }, [invoiceId])

  const mutationResponse = useWriteoffInvoiceMutation({ invoiceId })

  const { patchByTransformation: patchInvoiceWithTransformation } = useInvoicesGlobalCacheActions()
  const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void patchInvoiceWithTransformation(applyWriteoffToInvoice())

      void forceReloadInvoiceSummaryStats()

      return triggerResult
    },
    [originalTrigger, patchInvoiceWithTransformation, applyWriteoffToInvoice, forceReloadInvoiceSummaryStats],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
