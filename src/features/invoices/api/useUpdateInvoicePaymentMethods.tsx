import { Schema } from 'effect'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import { put } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

import {
  type InvoicePaymentMethodsResponse,
  InvoicePaymentMethodsResponseSchema,
  type InvoicePaymentMethodType,
} from './useInvoicePaymentMethods'

const UPDATE_INVOICE_PAYMENT_METHODS_TAG_KEY = '#update-invoice-payment-methods'

type UpdateInvoicePaymentMethodsBody = {
  payment_methods: InvoicePaymentMethodType[]
}

export const updateInvoicePaymentMethods = put<
  InvoicePaymentMethodsResponse,
  UpdateInvoicePaymentMethodsBody,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/payment-methods`)

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
      tags: [UPDATE_INVOICE_PAYMENT_METHODS_TAG_KEY],
    } as const
  }
}

type UpdateInvoicePaymentMethodsArg = InvoicePaymentMethodType[]

type UpdateInvoicePaymentMethodsSWRMutationResponse =
  SWRMutationResponse<InvoicePaymentMethodsResponse, unknown, Key, UpdateInvoicePaymentMethodsArg>

class UpdateInvoicePaymentMethodsSWRResponse {
  private swrResponse: UpdateInvoicePaymentMethodsSWRMutationResponse

  constructor(swrResponse: UpdateInvoicePaymentMethodsSWRMutationResponse) {
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

export function useUpdateInvoicePaymentMethods({ invoiceId }: { invoiceId: string }) {
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
      { arg: paymentMethods }: { arg: UpdateInvoicePaymentMethodsArg },
    ) => updateInvoicePaymentMethods(
      apiUrl,
      accessToken,
      {
        params: { businessId, invoiceId },
        body: { payment_methods: paymentMethods },
      },
    ).then(Schema.decodeUnknownPromise(InvoicePaymentMethodsResponseSchema)),
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  return new UpdateInvoicePaymentMethodsSWRResponse(rawMutationResponse)
}
