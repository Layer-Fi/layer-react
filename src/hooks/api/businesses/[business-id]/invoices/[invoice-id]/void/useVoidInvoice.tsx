import { InvoiceSchema } from '@schemas/invoices/invoice'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { useInvoiceSummaryStatsCacheActions } from '@hooks/api/businesses/[business-id]/invoices/summary-stats/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const VOID_INVOICE_TAG_KEY = '#void-invoice'

const VoidInvoiceReturnSchema = UnwrappedDataResponseSchema(InvoiceSchema)

const voidInvoice = post<
  typeof VoidInvoiceReturnSchema.Encoded,
  Record<string, never>,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/void`)

export const useVoidInvoice = createMutationHook({
  tags: [VOID_INVOICE_TAG_KEY],
  request: voidInvoice,
  keyParams: ['invoiceId'],
  argToBody: (_arg: never) => undefined,
  schema: VoidInvoiceReturnSchema,
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
