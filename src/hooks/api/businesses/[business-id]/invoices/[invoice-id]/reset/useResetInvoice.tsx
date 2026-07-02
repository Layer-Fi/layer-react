import { useCallback } from 'react'
import { Schema } from 'effect'

import { InvoiceSchema } from '@schemas/invoices/invoice'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useInvoiceSummaryStatsCacheActions } from '@hooks/api/businesses/[business-id]/invoices/summary-stats/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const RESET_INVOICE_TAG_KEY = '#reset-invoice'

const ResetInvoiceReturnSchema = Schema.Struct({
  data: InvoiceSchema,
})

const resetInvoice = post<
  typeof ResetInvoiceReturnSchema.Encoded,
  Record<string, never>,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/reset`)

const useResetInvoiceMutation = createMutationHook({
  tags: [RESET_INVOICE_TAG_KEY],
  request: resetInvoice,
  keyParams: ['invoiceId'],
  argToBody: (_arg: never) => undefined,
  schema: ResetInvoiceReturnSchema,
  swrOptions: { throwOnError: true },
})

type UseResetInvoiceProps = { invoiceId: string }

export const useResetInvoice = ({ invoiceId }: UseResetInvoiceProps) => {
  const mutationResponse = useResetInvoiceMutation({ invoiceId })

  const { patchByKey: patchInvoiceByKey } = useInvoicesGlobalCacheActions()
  const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void patchInvoiceByKey(triggerResult.data)

      void forceReloadInvoiceSummaryStats()

      return triggerResult
    },
    [originalTrigger, patchInvoiceByKey, forceReloadInvoiceSummaryStats],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
