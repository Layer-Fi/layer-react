import { useCallback } from 'react'
import { Schema } from 'effect'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import { post } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useInvoiceSummaryStatsCacheActions } from '@features/invoices/api/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@features/invoices/api/useListInvoices'
import { type Invoice, InvoiceStatus } from '@features/invoices/invoiceSchemas'
import { type CreateInvoiceWriteoff, CreateInvoiceWriteoffSchema, InvoiceWriteoffSchema } from '@features/invoices/invoiceWriteoffSchemas'

const CREATE_INVOICE_WRITEOFF_TAG_KEY = '#writeoff-invoice'

const writeoffInvoice = post<
  WriteoffInvoiceReturn,
  typeof CreateInvoiceWriteoffSchema.Encoded,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/write-off`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  invoiceId,
  invoiceWriteoffId = undefined,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  invoiceId: string
  invoiceWriteoffId?: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      invoiceId,
      invoiceWriteoffId,
      tags: [CREATE_INVOICE_WRITEOFF_TAG_KEY],
    } as const
  }
}

const WriteoffInvoiceReturnSchema = Schema.Struct({
  data: InvoiceWriteoffSchema,
})

type WriteoffInvoiceReturn = typeof WriteoffInvoiceReturnSchema.Type

type WriteoffInvoiceSWRMutationResponse =
    SWRMutationResponse<WriteoffInvoiceReturn, unknown, Key, CreateInvoiceWriteoff>

class WriteoffInvoiceSWRResponse {
  private swrResponse: WriteoffInvoiceSWRMutationResponse

  constructor(swrResponse: WriteoffInvoiceSWRMutationResponse) {
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

export const updateInvoiceWithWriteoff = (invoice: Invoice): Invoice => {
  const status = invoice.status === InvoiceStatus.PartiallyPaid ? InvoiceStatus.PartiallyWrittenOff : InvoiceStatus.WrittenOff

  return { ...invoice, status, outstandingBalance: 0 }
}

type UseWriteoffInvoiceProps = { invoiceId: string }
export const useWriteoffInvoice = ({ invoiceId }: UseWriteoffInvoiceProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const applyWriteoffToInvoice = useCallback(() =>
    (invoice: Invoice) => {
      if (invoice.id !== invoiceId) return invoice
      return updateInvoiceWithWriteoff(invoice)
    }, [invoiceId])

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      invoiceId,
    }),
    (
      { accessToken, apiUrl, businessId, invoiceId },
      { arg: decodedBody }: { arg: CreateInvoiceWriteoff },
    ) => {
      const body = Schema.encodeSync(CreateInvoiceWriteoffSchema)(decodedBody)
      return writeoffInvoice(
        apiUrl,
        accessToken,
        { params: { businessId, invoiceId }, body },
      ).then(Schema.decodeUnknownPromise(WriteoffInvoiceReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new WriteoffInvoiceSWRResponse(rawMutationResponse)

  const { patchInvoiceWithTransformation } = useInvoicesGlobalCacheActions()
  const { forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void patchInvoiceWithTransformation(applyWriteoffToInvoice())

      void forceReloadInvoiceSummaryStats()

      return triggerResult
    },
    [originalTrigger, patchInvoiceWithTransformation, applyWriteoffToInvoice, forceReloadInvoiceSummaryStats],
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
