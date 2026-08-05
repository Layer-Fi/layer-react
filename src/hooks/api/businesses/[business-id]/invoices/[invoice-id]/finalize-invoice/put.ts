import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type FinalizeInvoiceBodyEncoded, FinalizeInvoiceDataSchema } from '@schemas/features/invoices/finalizeInvoice'
import { put } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useInvoicePaymentMethodsGlobalCacheActions } from '@api/businesses/[business-id]/invoices/[invoice-id]/payment-methods/get'
import { useInvoicesGlobalCacheActions } from '@api/businesses/[business-id]/invoices/get'
import { useInvoiceSummaryStatsCacheActions } from '@api/businesses/[business-id]/invoices/summary-stats/get'

const FINALIZE_INVOICE_TAG_KEY = '#finalize-invoice'

export const FinalizeInvoiceResponseSchema = UnwrappedDataResponseSchema(FinalizeInvoiceDataSchema)

export const finalizeInvoice = put<
  typeof FinalizeInvoiceResponseSchema.Encoded,
  FinalizeInvoiceBodyEncoded,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/finalize-invoice`)

export const usePutFinalizeInvoice = createMutationHook({
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
