import { Schema } from 'effect'
import useSWR, { type SWRResponse } from 'swr'

import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const INVOICE_PAYMENT_METHODS_TAG_KEY = '#invoice-payment-methods'

export enum InvoicePaymentMethodType {
  ACH = 'ACH',
  CreditCard = 'CREDIT_CARD',
}

const InvoicePaymentMethodTypeSchema = Schema.Enums(InvoicePaymentMethodType)

export const InvoicePaymentMethodsResponseSchema = Schema.Struct({
  data: Schema.Array(InvoicePaymentMethodTypeSchema),
})
export type InvoicePaymentMethodsResponse = typeof InvoicePaymentMethodsResponseSchema.Type

class InvoicePaymentMethodsSWRResponse {
  private swrResponse: SWRResponse<InvoicePaymentMethodsResponse>

  constructor(swrResponse: SWRResponse<InvoicePaymentMethodsResponse>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  invoiceId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  invoiceId: string | null
}) {
  if (accessToken && apiUrl && invoiceId) {
    return {
      accessToken,
      apiUrl,
      businessId,
      invoiceId,
      tags: [INVOICE_PAYMENT_METHODS_TAG_KEY],
    } as const
  }
}

const getInvoicePaymentMethods = get<
  InvoicePaymentMethodsResponse,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/payment-methods`)

export function useInvoicePaymentMethods({ invoiceId }: { invoiceId: string | null }) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => buildKey({
      ...data,
      businessId,
      invoiceId,
    }),
    ({ accessToken, apiUrl, businessId, invoiceId }) => getInvoicePaymentMethods(
      apiUrl,
      accessToken,
      {
        params: { businessId, invoiceId },
      },
    )().then(Schema.decodeUnknownPromise(InvoicePaymentMethodsResponseSchema)),
  )

  return new InvoicePaymentMethodsSWRResponse(response)
}
