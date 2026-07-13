import { type FinalizeInvoiceBodyEncoded, FinalizeInvoiceDataSchema } from '@schemas/invoices/finalizeInvoice'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { put } from '@utils/api/authenticatedHttp'
import { useInvoicePaymentMethodsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/payment-methods/useInvoicePaymentMethods'
import { useInvoiceSummaryStatsCacheActions } from '@hooks/api/businesses/[business-id]/invoices/summary-stats/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const FINALIZE_INVOICE_TAG_KEY = '#finalize-invoice'

export const FinalizeInvoiceResponseSchema = UnwrappedDataResponseSchema(FinalizeInvoiceDataSchema)

export const finalizeInvoice = put<
  typeof FinalizeInvoiceResponseSchema.Encoded,
  FinalizeInvoiceBodyEncoded,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/finalize-invoice`)

export const useFinalizeInvoice = createMutationHook({
  tags: [FINALIZE_INVOICE_TAG_KEY],
  request: finalizeInvoice,
  keyParams: ['invoiceId'],
  schema: FinalizeInvoiceResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchByKey: patchInvoiceByKey } = useInvoicesGlobalCacheActions()
    const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()
    const { forceReload: forceReloadInvoicePaymentMethods } = useInvoicePaymentMethodsGlobalCacheActions()

    return (data) => {
      void patchInvoiceByKey(data.invoice)

      void forceReloadInvoiceSummaryStats()

      void forceReloadInvoicePaymentMethods()
    }
  },
})
