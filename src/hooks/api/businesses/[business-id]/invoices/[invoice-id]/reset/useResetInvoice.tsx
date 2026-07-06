import { InvoiceSchema } from '@schemas/invoices/invoice'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { useInvoiceSummaryStatsCacheActions } from '@hooks/api/businesses/[business-id]/invoices/summary-stats/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const RESET_INVOICE_TAG_KEY = '#reset-invoice'

const ResetInvoiceReturnSchema = UnwrappedDataResponseSchema(InvoiceSchema)

const resetInvoice = post<
  typeof ResetInvoiceReturnSchema.Encoded,
  Record<string, never>,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/reset`)

export const useResetInvoice = createMutationHook({
  tags: [RESET_INVOICE_TAG_KEY],
  request: resetInvoice,
  keyParams: ['invoiceId'],
  argToBody: (_arg: never) => undefined,
  schema: ResetInvoiceReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchByKey: patchInvoiceByKey } = useInvoicesGlobalCacheActions()
    const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()
    return (data) => {
      void patchInvoiceByKey(data)

      void forceReloadInvoiceSummaryStats()
    }
  },
})
