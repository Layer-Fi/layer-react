import { useCallback } from 'react'
import { Schema } from 'effect'
import type { Key } from 'swr'
import { useSWRConfig } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { put } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useInvoiceSummaryStatsCacheActions } from '@features/invoices/api/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@features/invoices/api/useListInvoices'
import { InvoicePaymentMethodsSchema } from '@features/invoices/invoicePaymentMethodSchemas'
import { InvoiceSchema } from '@features/invoices/invoiceSchemas'

import { INVOICE_PAYMENT_METHODS_TAG_KEY } from './useInvoicePaymentMethods'

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

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  invoiceId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  invoiceId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      invoiceId,
      tags: [FINALIZE_INVOICE_TAG_KEY],
    } as const
  }
}

type FinalizeInvoiceSWRMutationResponse =
    SWRMutationResponse<FinalizeInvoiceResponse, unknown, Key, FinalizeInvoiceBodyEncoded>

class FinalizeInvoiceSWRResponse {
  private swrResponse: FinalizeInvoiceSWRMutationResponse

  constructor(swrResponse: FinalizeInvoiceSWRMutationResponse) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get trigger() {
    return this.swrResponse.trigger
  }

  get isMutating() {
    return this.swrResponse.isMutating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

type UseFinalizeInvoiceProps = {
  invoiceId: string
}

export function useFinalizeInvoice({ invoiceId }: UseFinalizeInvoiceProps) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      invoiceId,
    }),
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

  const mutationResponse = new FinalizeInvoiceSWRResponse(rawMutationResponse)

  const { patchInvoiceByKey } = useInvoicesGlobalCacheActions()
  const { forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

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

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
