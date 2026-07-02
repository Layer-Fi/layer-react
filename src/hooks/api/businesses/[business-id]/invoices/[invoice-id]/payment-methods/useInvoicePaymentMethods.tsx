import { Schema } from 'effect'
import useSWR from 'swr'

import {
  type InvoicePaymentMethodsResponse,
  InvoicePaymentMethodsResponseSchema,
} from '@schemas/invoices/invoicePaymentMethod'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const INVOICE_PAYMENT_METHODS_TAG_KEY = '#invoice-payment-methods'

const buildKey = createBuildKey<{ businessId: string, invoiceId: string }>([INVOICE_PAYMENT_METHODS_TAG_KEY])

const getInvoicePaymentMethods = get<
  InvoicePaymentMethodsResponse,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/payment-methods`)

interface UseInvoicePaymentMethodsProps {
  invoiceId: string
  isEnabled?: boolean
}

export function useInvoicePaymentMethods({
  invoiceId,
  isEnabled = true,
}: UseInvoicePaymentMethodsProps) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const response = useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      invoiceId,
      isEnabled: isEnabled && Boolean(invoiceId),
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
