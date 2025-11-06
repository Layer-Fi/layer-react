import { useCallback } from 'react'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import { post } from '@api/layer/authenticated_http'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useAuth } from '@hooks/useAuth'
import { InvoiceSchema } from '@features/invoices/invoiceSchemas'
import { Schema } from 'effect'
import { useInvoicesGlobalCacheActions } from '@features/invoices/api/useListInvoices'
import { useInvoiceSummaryStatsCacheActions } from '@features/invoices/api/useInvoiceSummaryStats'

const RESET_INVOICE_TAG_KEY = '#reset-invoice'

const ResetInvoiceReturnSchema = Schema.Struct({
  data: InvoiceSchema,
})

type ResetInvoiceReturn = typeof ResetInvoiceReturnSchema.Type

const resetInvoice = post<
  ResetInvoiceReturn,
  never,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/reset`)

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
      tags: [RESET_INVOICE_TAG_KEY],
    } as const
  }
}

type ResetInvoiceSWRMutationResponse =
    SWRMutationResponse<ResetInvoiceReturn, unknown, Key, never>

class ResetInvoiceSWRResponse {
  private swrResponse: ResetInvoiceSWRMutationResponse

  constructor(swrResponse: ResetInvoiceSWRMutationResponse) {
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

type UseResetInvoiceProps = { invoiceId: string }

export const useResetInvoice = ({ invoiceId }: UseResetInvoiceProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      invoiceId,
    }),
    (
      { accessToken, apiUrl, businessId, invoiceId },
    ) => {
      return resetInvoice(
        apiUrl,
        accessToken,
        { params: { businessId, invoiceId } },
      ).then(Schema.decodeUnknownPromise(ResetInvoiceReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new ResetInvoiceSWRResponse(rawMutationResponse)

  const { patchInvoiceByKey } = useInvoicesGlobalCacheActions()
  const { forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

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
