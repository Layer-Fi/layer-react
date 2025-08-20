import { useCallback } from 'react'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import { post, put } from '../../../api/layer/authenticated_http'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useAuth } from '../../../hooks/useAuth'
import { InvoicePaymentSchema, InvoiceStatus, type Invoice, type InvoicePayment, type UpsertDedicatedInvoicePaymentSchema } from '../invoiceSchemas'
import { Schema, Effect } from 'effect'
import { useInvoicesGlobalCacheActions } from './useListInvoices'
import { useInvoiceSummaryStatsCacheActions } from './useInvoiceSummaryStats'

const UPSERT_INVOICE_PAYMENT_TAG_KEY = '#upsert-invoice'

export enum UpsertDedicatedInvoicePaymentMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertDedicatedInvoicePaymentBody = typeof UpsertDedicatedInvoicePaymentSchema.Encoded

const createDedicatedInvoicePayment = post<
  UpsertDedicatedInvoicePaymentReturn,
  UpsertDedicatedInvoicePaymentBody,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/payment/`)

const updateDedicatedInvoicePayment = put<
  UpsertDedicatedInvoicePaymentReturn,
  UpsertDedicatedInvoicePaymentBody,
  { businessId: string, invoiceId: string, invoicePaymentId: string }
>(({ businessId, invoiceId, invoicePaymentId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/payment/${invoicePaymentId}`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  invoiceId,
  invoicePaymentId = undefined,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  invoiceId: string
  invoicePaymentId?: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      invoiceId,
      invoicePaymentId,
      tags: [UPSERT_INVOICE_PAYMENT_TAG_KEY],
    } as const
  }
}

const UpsertDedicatedInvoicePaymentReturnSchema = Schema.Struct({
  data: InvoicePaymentSchema,
})

type UpsertDedicatedInvoicePaymentReturn = typeof UpsertDedicatedInvoicePaymentReturnSchema.Type

type UpsertDedicatedInvoicePaymentSWRMutationResponse =
    SWRMutationResponse<UpsertDedicatedInvoicePaymentReturn, unknown, Key, UpsertDedicatedInvoicePaymentBody>

class UpsertDedicatedInvoicePaymentSWRResponse {
  private swrResponse: UpsertDedicatedInvoicePaymentSWRMutationResponse

  constructor(swrResponse: UpsertDedicatedInvoicePaymentSWRMutationResponse) {
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

const CreateParamsSchema = Schema.Struct({
  businessId: Schema.String,
  invoiceId: Schema.String,
})

const UpdateParamsSchema = Schema.Struct({
  businessId: Schema.String,
  invoiceId: Schema.String,
  invoicePaymentId: Schema.String,
})

export type CreateParams = typeof CreateParamsSchema.Type
export type UpdateParams = typeof UpdateParamsSchema.Type

export type UpsertParams = CreateParams | UpdateParams

type RequestArgs = {
  apiUrl: string
  accessToken: string
  body: UpsertDedicatedInvoicePaymentBody
}

type UpsertRequestFn = (args: RequestArgs) => Promise<UpsertDedicatedInvoicePaymentReturn>

const isParamsValidForMode = <M extends UpsertDedicatedInvoicePaymentMode>(
  mode: M,
  params: unknown,
): params is M extends UpsertDedicatedInvoicePaymentMode.Update ? UpdateParams : CreateParams => {
  if (mode === UpsertDedicatedInvoicePaymentMode.Update) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(UpdateParamsSchema)(params)))._tag === 'Right'
  }

  if (mode === UpsertDedicatedInvoicePaymentMode.Create) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(CreateParamsSchema)(params)))._tag === 'Right'
  }

  return false
}

export const updateInvoiceWithPayment = (invoice: Invoice, invoicePayment: InvoicePayment) => {
  const outstandingBalance = invoice.outstandingBalance - invoicePayment.amount
  const status = outstandingBalance === 0 ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid

  return { ...invoice, status, outstandingBalance }
}

function getRequestFn(
  mode: UpsertDedicatedInvoicePaymentMode,
  params: UpsertParams,
): UpsertRequestFn {
  if (mode === UpsertDedicatedInvoicePaymentMode.Update) {
    if (!isParamsValidForMode(UpsertDedicatedInvoicePaymentMode.Update, params)) {
      throw new Error('Invalid params for upsert mode')
    }

    return ({ apiUrl, accessToken, body }: { apiUrl: string, accessToken: string, body: UpsertDedicatedInvoicePaymentBody }) =>
      updateDedicatedInvoicePayment(apiUrl, accessToken, { params, body })
  }
  else {
    if (!isParamsValidForMode(UpsertDedicatedInvoicePaymentMode.Create, params)) {
      throw new Error('Invalid params for create mode')
    }

    return ({ apiUrl, accessToken, body }: { apiUrl: string, accessToken: string, body: UpsertDedicatedInvoicePaymentBody }) =>
      createDedicatedInvoicePayment(apiUrl, accessToken, { params, body })
  }
}

type UseUpsertDedicatedInvoicePaymentProps =
  | { mode: UpsertDedicatedInvoicePaymentMode.Create, invoiceId: string }
  | { mode: UpsertDedicatedInvoicePaymentMode.Update, invoiceId: string, invoicePaymentId: string }

export const useUpsertDedicatedInvoicePayment = (props: UseUpsertDedicatedInvoicePaymentProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const { mode, invoiceId } = props
  const invoicePaymentId = mode === UpsertDedicatedInvoicePaymentMode.Update ? props.invoicePaymentId : undefined

  const applyPaymentToInvoice = useCallback((invoicePayment: InvoicePayment) =>
    (invoice: Invoice) => {
      if (invoice.id !== invoiceId) return invoice
      return updateInvoiceWithPayment(invoice, invoicePayment)
    }, [invoiceId])

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      invoiceId,
      invoicePaymentId,
    }),
    (
      { accessToken, apiUrl, businessId, invoiceId },
      { arg: body }: { arg: UpsertDedicatedInvoicePaymentBody },
    ) => {
      const request = getRequestFn(mode, { businessId, invoiceId })

      return request({
        apiUrl,
        accessToken,
        body,
      }).then(Schema.decodeUnknownPromise(UpsertDedicatedInvoicePaymentReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new UpsertDedicatedInvoicePaymentSWRResponse(rawMutationResponse)

  const { patchInvoiceWithTransformation } = useInvoicesGlobalCacheActions()
  const { forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void patchInvoiceWithTransformation(applyPaymentToInvoice(triggerResult.data))

      void forceReloadInvoiceSummaryStats()

      return triggerResult
    },
    [originalTrigger, patchInvoiceWithTransformation, applyPaymentToInvoice, forceReloadInvoiceSummaryStats],
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
