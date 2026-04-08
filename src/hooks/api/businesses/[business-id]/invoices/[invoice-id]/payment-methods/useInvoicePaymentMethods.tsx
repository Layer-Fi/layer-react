import { Schema } from 'effect'
import useSWR from 'swr'

import {
  type InvoicePaymentMethodsResponse,
  InvoicePaymentMethodsResponseSchema,
} from '@schemas/invoices/invoicePaymentMethod'
import { get } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const INVOICE_PAYMENT_METHODS_TAG_KEY = '#invoice-payment-methods'

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
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => withLocale(buildKey({
      ...data,
      businessId,
      invoiceId,
    })),
    ({ accessToken, apiUrl, businessId, invoiceId }) => getInvoicePaymentMethods(
      apiUrl,
      accessToken,
      {
        params: { businessId, invoiceId },
      },
    )().then(Schema.decodeUnknownPromise(InvoicePaymentMethodsResponseSchema)),
  )
  return new SWRQueryResult(response)
}

export function usePreloadInvoicePaymentMethods(props: UseInvoicePaymentMethodsProps) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useInvoicePaymentMethods(props)
}
