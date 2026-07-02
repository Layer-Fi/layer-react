import { useCallback } from 'react'
import { Schema } from 'effect'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import { InvoiceSchema } from '@schemas/invoices/invoice'
import { InvoicePaymentMethodsSchema } from '@schemas/invoices/invoicePaymentMethod'
import { put } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { INVOICE_PAYMENT_METHODS_TAG_KEY } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/payment-methods/useInvoicePaymentMethods'
import { useInvoiceSummaryStatsCacheActions } from '@hooks/api/businesses/[business-id]/invoices/summary-stats/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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

export const FinalizeInvoiceResponseSchema = Schema.Struct({
  data: Schema.extend(
    InvoicePaymentMethodsSchema,
    Schema.Struct({
      invoice: InvoiceSchema,
    }),
  ),
})

type FinalizeInvoiceResponse = typeof FinalizeInvoiceResponseSchema.Type

export const finalizeInvoice = put<
  FinalizeInvoiceResponse,
  FinalizeInvoiceBodyEncoded,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/finalize-invoice`)

const buildKey = createBuildKey<{ businessId: string, invoiceId: string }>([FINALIZE_INVOICE_TAG_KEY])

type UseFinalizeInvoiceProps = {
  invoiceId: string
}

export function useFinalizeInvoice({ invoiceId }: UseFinalizeInvoiceProps) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()
  const { mutate } = useSWRConfig()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      invoiceId,
    })),
    (
      { accessToken, apiUrl, businessId, invoiceId },
      { arg: body }: { arg: FinalizeInvoiceBodyEncoded },
    ) => finalizeInvoice(
      apiUrl,
      accessToken,
      {
        params: { businessId, invoiceId },
        body,
      },
    ).then(Schema.decodeUnknownPromise(FinalizeInvoiceResponseSchema)),
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

  const { patchByKey: patchInvoiceByKey } = useInvoicesGlobalCacheActions()
  const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void patchInvoiceByKey(triggerResult.data.invoice)

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
