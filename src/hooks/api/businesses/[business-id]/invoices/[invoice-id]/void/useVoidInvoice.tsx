import { useCallback } from 'react'

import { InvoiceSchema } from '@schemas/invoices/invoice'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
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

const useVoidInvoiceMutation = createMutationHook({
  tags: [VOID_INVOICE_TAG_KEY],
  request: voidInvoice,
  keyParamNames: ['invoiceId'],
  argToBody: (_arg: never) => undefined,
  schema: VoidInvoiceReturnSchema,
  swrOptions: { throwOnError: true },
})

type UseVoidInvoiceProps = { invoiceId: string }

export const useVoidInvoice = ({ invoiceId }: UseVoidInvoiceProps) => {
  const mutationResponse = useVoidInvoiceMutation({ invoiceId })

  const { patchByKey: patchInvoiceByKey } = useInvoicesGlobalCacheActions()
  const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void patchInvoiceByKey(triggerResult)

      void forceReloadInvoiceSummaryStats()

      return triggerResult
    },
    [originalTrigger, patchInvoiceByKey, forceReloadInvoiceSummaryStats],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
