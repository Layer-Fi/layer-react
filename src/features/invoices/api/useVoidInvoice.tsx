import { useCallback } from 'react'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import { post } from '../../../api/layer/authenticated_http'
import { useLayerContext } from '../../../contexts/LayerContext/LayerContext'
import { useAuth } from '../../../hooks/useAuth'
import { InvoiceSchema } from '../invoiceSchemas'
import { Schema } from 'effect'
import { useInvoicesGlobalCacheActions } from './useListInvoices'
import { useInvoiceSummaryStatsCacheActions } from './useInvoiceSummaryStats'

const VOID_INVOICE_TAG_KEY = '#void-invoice'

const VoidInvoiceReturnSchema = Schema.Struct({
  data: InvoiceSchema,
})

type VoidInvoiceReturn = typeof VoidInvoiceReturnSchema.Type

const voidInvoice = post<
  VoidInvoiceReturn,
  never,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/void`)

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
      tags: [VOID_INVOICE_TAG_KEY],
    } as const
  }
}

type VoidInvoiceSWRMutationResponse =
    SWRMutationResponse<VoidInvoiceReturn, unknown, Key, never>

class VoidInvoiceSWRResponse {
  private swrResponse: VoidInvoiceSWRMutationResponse

  constructor(swrResponse: VoidInvoiceSWRMutationResponse) {
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

type UseVoidInvoiceProps = { invoiceId: string }

export const useVoidInvoice = ({ invoiceId }: UseVoidInvoiceProps) => {
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
      return voidInvoice(
        apiUrl,
        accessToken,
        { params: { businessId, invoiceId } },
      ).then(Schema.decodeUnknownPromise(VoidInvoiceReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new VoidInvoiceSWRResponse(rawMutationResponse)

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
