import { useCallback } from 'react'
import { Schema } from 'effect'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import { post } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useInvoiceSummaryStatsCacheActions } from '@features/invoices/api/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@features/invoices/api/useListInvoices'
import { type CreateCustomerRefundSchema, CustomerRefundSchema } from '@features/invoices/customerRefundSchemas'
import { type Invoice, InvoiceStatus } from '@features/invoices/invoiceSchemas'

const REFUND_INVOICE_TAG_KEY = '#refund-invoice'

const RefundInvoiceReturnSchema = Schema.Struct({
  data: CustomerRefundSchema,
})

type RefundInvoiceBody = typeof CreateCustomerRefundSchema.Encoded

type RefundInvoiceReturn = typeof RefundInvoiceReturnSchema.Type

const refundInvoice = post<
  RefundInvoiceReturn,
  typeof CreateCustomerRefundSchema.Encoded,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/refund`)

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
      tags: [REFUND_INVOICE_TAG_KEY],
    } as const
  }
}

type RefundInvoiceSWRMutationResponse =
    SWRMutationResponse<RefundInvoiceReturn, unknown, Key, RefundInvoiceBody>

class RefundInvoiceSWRResponse {
  private swrResponse: RefundInvoiceSWRMutationResponse

  constructor(swrResponse: RefundInvoiceSWRMutationResponse) {
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

export const updateInvoiceWithRefund = (invoice: Invoice): Invoice => {
  return { ...invoice, status: InvoiceStatus.Refunded }
}

type UseRefundInvoiceProps = { invoiceId: string }
export const useRefundInvoice = ({ invoiceId }: UseRefundInvoiceProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const applyRefundToInvoice = useCallback(() =>
    (invoice: Invoice) => {
      if (invoice.id !== invoiceId) return invoice
      return updateInvoiceWithRefund(invoice)
    }, [invoiceId])

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      invoiceId,
    }),
    (
      { accessToken, apiUrl, businessId, invoiceId },
      { arg: body }: { arg: RefundInvoiceBody },
    ) => {
      return refundInvoice(
        apiUrl,
        accessToken,
        { params: { businessId, invoiceId }, body },
      ).then(Schema.decodeUnknownPromise(RefundInvoiceReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new RefundInvoiceSWRResponse(rawMutationResponse)

  const { patchInvoiceWithTransformation } = useInvoicesGlobalCacheActions()
  const { forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void patchInvoiceWithTransformation(applyRefundToInvoice())

      void forceReloadInvoiceSummaryStats()

      return triggerResult
    },
    [originalTrigger, patchInvoiceWithTransformation, applyRefundToInvoice, forceReloadInvoiceSummaryStats],
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
