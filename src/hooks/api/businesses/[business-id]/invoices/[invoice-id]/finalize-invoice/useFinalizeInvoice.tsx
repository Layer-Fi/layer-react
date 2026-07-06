import { useCallback } from 'react'
import { Schema } from 'effect'
import { useSWRConfig } from 'swr'

import { InvoiceSchema } from '@schemas/invoices/invoice'
import { InvoicePaymentMethodsSchema } from '@schemas/invoices/invoicePaymentMethod'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { put } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { INVOICE_PAYMENT_METHODS_TAG_KEY } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/payment-methods/useInvoicePaymentMethods'
import { useInvoiceSummaryStatsCacheActions } from '@hooks/api/businesses/[business-id]/invoices/summary-stats/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const FINALIZE_INVOICE_TAG_KEY = '#finalize-invoice'

export const FinalizeInvoiceBodySchema = Schema.extend(
  InvoicePaymentMethodsSchema,
  Schema.Struct({
    customPaymentInstructions: Schema.optional(Schema.String).pipe(
      Schema.fromKey('custom_payment_instructions'),
    ),
  }),
)

export type FinalizeInvoiceBody = typeof FinalizeInvoiceBodySchema.Type
export type FinalizeInvoiceBodyEncoded = typeof FinalizeInvoiceBodySchema.Encoded

export const FinalizeInvoiceResponseSchema = UnwrappedDataResponseSchema(
  Schema.extend(
    InvoicePaymentMethodsSchema,
    Schema.Struct({
      invoice: InvoiceSchema,
    }),
  ),
)

export const finalizeInvoice = put<
  typeof FinalizeInvoiceResponseSchema.Encoded,
  FinalizeInvoiceBodyEncoded,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/finalize-invoice`)

const useFinalizeInvoiceMutation = createMutationHook({
  tags: [FINALIZE_INVOICE_TAG_KEY],
  request: finalizeInvoice,
  keyParamNames: ['invoiceId'],
  schema: FinalizeInvoiceResponseSchema,
  swrOptions: { throwOnError: true },
})

type UseFinalizeInvoiceProps = {
  invoiceId: string
}

export function useFinalizeInvoice({ invoiceId }: UseFinalizeInvoiceProps) {
  const { mutate } = useSWRConfig()

  const mutationResponse = useFinalizeInvoiceMutation({ invoiceId })

  const { patchByKey: patchInvoiceByKey } = useInvoicesGlobalCacheActions()
  const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void patchInvoiceByKey(triggerResult.invoice)

      void forceReloadInvoiceSummaryStats()

      void mutate(key => withSWRKeyTags(
        key,
        ({ tags }) => tags.includes(INVOICE_PAYMENT_METHODS_TAG_KEY),
      ))

      return triggerResult
    },
    [
      originalTrigger,
      patchInvoiceByKey,
      forceReloadInvoiceSummaryStats,
      mutate,
    ],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
