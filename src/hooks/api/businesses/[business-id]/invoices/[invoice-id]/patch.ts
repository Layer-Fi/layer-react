import { patch } from '@utils/shared/api/authenticatedHttp'
import { useInvoicesGlobalCacheActions } from '@api/businesses/[business-id]/invoices/get'
import {
  UPSERT_INVOICE_TAG_KEY,
  type UpsertInvoiceBody,
  type UpsertInvoiceReturnEncoded,
  UpsertInvoiceReturnSchema,
} from '@api/businesses/[business-id]/invoices/post'
import { useInvoiceSummaryStatsCacheActions } from '@api/businesses/[business-id]/invoices/summary-stats/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

export type UpdateParams = {
  readonly businessId: string
  readonly invoiceId: string
}

const updateInvoice = patch<
  UpsertInvoiceReturnEncoded,
  UpsertInvoiceBody,
  UpdateParams
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}`)

export const usePatchInvoice = createMutationHook({
  tags: [UPSERT_INVOICE_TAG_KEY],
  request: updateInvoice,
  keyParams: ['invoiceId'],
  schema: UpsertInvoiceReturnSchema,
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
