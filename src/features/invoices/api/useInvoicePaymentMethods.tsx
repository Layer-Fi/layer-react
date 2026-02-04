import { Schema } from 'effect'
import useSWR, { type SWRResponse } from 'swr'

import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import {
  type InvoicePaymentMethodsResponse,
  InvoicePaymentMethodsResponseSchema,
} from '@features/invoices/invoicePaymentMethodSchemas'

export const INVOICE_PAYMENT_METHODS_TAG_KEY = '#invoice-payment-methods'

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

interface UseInvoicePaymentMethodsProps {
  invoiceId: string
}

export function useInvoicePaymentMethods({ invoiceId }: UseInvoicePaymentMethodsProps) {
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

export function usePreloadInvoicePaymentMethods(props: UseInvoicePaymentMethodsProps) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useInvoicePaymentMethods(props)
}
