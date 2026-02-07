import { useCallback } from 'react'
import { Effect, Schema } from 'effect'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import { patch, post } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useInvoiceSummaryStatsCacheActions } from '@features/invoices/api/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@features/invoices/api/useListInvoices'
import { InvoiceSchema, type UpsertInvoiceSchema } from '@features/invoices/invoiceSchemas'

const UPSERT_INVOICE_TAG_KEY = '#upsert-invoice'

export enum UpsertInvoiceMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertInvoiceBody = typeof UpsertInvoiceSchema.Encoded

const createInvoice = post<
  UpsertInvoiceReturn,
  UpsertInvoiceBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/invoices`)

const updateInvoice = patch<
  UpsertInvoiceReturn,
  UpsertInvoiceBody,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  invoiceId = undefined,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  invoiceId?: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      invoiceId,
      tags: [UPSERT_INVOICE_TAG_KEY],
    } as const
  }
}

const UpsertInvoiceReturnSchema = Schema.Struct({
  data: InvoiceSchema,
})

type UpsertInvoiceReturn = typeof UpsertInvoiceReturnSchema.Type

type UpsertInvoiceSWRMutationResponse =
    SWRMutationResponse<UpsertInvoiceReturn, unknown, Key, UpsertInvoiceBody>

class UpsertInvoiceSWRResponse {
  private swrResponse: UpsertInvoiceSWRMutationResponse

  constructor(swrResponse: UpsertInvoiceSWRMutationResponse) {
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
})

const UpdateParamsSchema = Schema.Struct({
  businessId: Schema.String,
  invoiceId: Schema.String,
})

export type CreateParams = typeof CreateParamsSchema.Type
export type UpdateParams = typeof UpdateParamsSchema.Type

export type UpsertParams = CreateParams | UpdateParams

type RequestArgs = {
  apiUrl: string
  accessToken: string
  body: UpsertInvoiceBody
}

type UpsertRequestFn = (args: RequestArgs) => Promise<UpsertInvoiceReturn>

const isParamsValidForMode = <M extends UpsertInvoiceMode>(
  mode: M,
  params: unknown,
): params is M extends UpsertInvoiceMode.Update ? UpdateParams : CreateParams => {
  if (mode === UpsertInvoiceMode.Update) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(UpdateParamsSchema)(params)))._tag === 'Right'
  }

  if (mode === UpsertInvoiceMode.Create) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(CreateParamsSchema)(params)))._tag === 'Right'
  }

  return false
}

function getRequestFn(
  mode: UpsertInvoiceMode,
  params: UpsertParams,
): UpsertRequestFn {
  if (mode === UpsertInvoiceMode.Update) {
    if (!isParamsValidForMode(UpsertInvoiceMode.Update, params)) {
      throw new Error('Invalid params for update mode')
    }

    return ({ apiUrl, accessToken, body }: { apiUrl: string, accessToken: string, body: UpsertInvoiceBody }) =>
      updateInvoice(apiUrl, accessToken, { params, body })
  }
  else {
    if (!isParamsValidForMode(UpsertInvoiceMode.Create, params)) {
      throw new Error('Invalid params for create mode')
    }

    return ({ apiUrl, accessToken, body }: { apiUrl: string, accessToken: string, body: UpsertInvoiceBody }) =>
      createInvoice(apiUrl, accessToken, { params, body })
  }
}

type UseUpsertInvoiceProps =
  | { mode: UpsertInvoiceMode.Create }
  | { mode: UpsertInvoiceMode.Update, invoiceId: string }

export const useUpsertInvoice = (props: UseUpsertInvoiceProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const { mode } = props
  const invoiceId = mode === UpsertInvoiceMode.Update ? props.invoiceId : undefined

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      invoiceId,
    }),
    (
      { accessToken, apiUrl, businessId, invoiceId },
      { arg: body }: { arg: UpsertInvoiceBody },
    ) => {
      const request = getRequestFn(mode, { businessId, invoiceId })

      return request({
        apiUrl,
        accessToken,
        body,
      }).then(Schema.decodeUnknownPromise(UpsertInvoiceReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new UpsertInvoiceSWRResponse(rawMutationResponse)

  const { patchInvoiceByKey, forceReloadInvoices } = useInvoicesGlobalCacheActions()
  const { forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      if (mode === UpsertInvoiceMode.Update) {
        void patchInvoiceByKey(triggerResult.data)
      }
      else {
        void forceReloadInvoices()
      }

      void forceReloadInvoiceSummaryStats()

      return triggerResult
    },
    [originalTrigger, mode, patchInvoiceByKey, forceReloadInvoices, forceReloadInvoiceSummaryStats],
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
