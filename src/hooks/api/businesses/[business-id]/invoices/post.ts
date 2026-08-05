import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { InvoiceSchema } from '@schemas/invoices/invoice'
import { type UpsertInvoiceSchema } from '@schemas/invoices/upsertInvoice'
import { post } from '@utils/shared/api/authenticatedHttp'
import { useInvoicesGlobalCacheActions } from '@api/businesses/[business-id]/invoices/get'
import { useInvoiceSummaryStatsCacheActions } from '@api/businesses/[business-id]/invoices/summary-stats/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

export const UPSERT_INVOICE_TAG_KEY = '#upsert-invoice'

export type UpsertInvoiceBody = typeof UpsertInvoiceSchema.Encoded

export const UpsertInvoiceReturnSchema = UnwrappedDataResponseSchema(InvoiceSchema)

export type UpsertInvoiceReturnEncoded = typeof UpsertInvoiceReturnSchema.Encoded

export type CreateParams = {
  readonly businessId: string
}

const createInvoice = post<
  UpsertInvoiceReturnEncoded,
  UpsertInvoiceBody,
  CreateParams
>(({ businessId }) => `/v1/businesses/${businessId}/invoices`)

export const usePostInvoice = createMutationHook({
  tags: [UPSERT_INVOICE_TAG_KEY],
  request: createInvoice,
  schema: UpsertInvoiceReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadInvoices } = useInvoicesGlobalCacheActions()
    const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

    return () => {
      void forceReloadInvoices()
      void forceReloadInvoiceSummaryStats()
    }
  },
})
